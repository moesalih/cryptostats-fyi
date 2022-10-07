import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

const axios = require('axios').default;
const moment = require('moment')



let Helpers = {}

Helpers.unique = (value, index, self) => { return self.indexOf(value) === index }

Helpers.cryptostatsURL = (collection, queries, args, metadata) => {
	let url = 'https://api.cryptostats.community/api/v1/' + collection + '/' + queries.join(',')
	if (args.length > 0) url += '/' + args.join(',')
	url += '?metadata=' + metadata
	return url
}
Helpers.loadCryptoStats = async (collection, queries, args = [], metadata = true) => {
	try {
		let { data } = await axios.get(Helpers.cryptostatsURL(collection, queries, args, metadata))
		let protocols = data.data
		if (protocols) protocols = protocols.filter(protocol => protocol.results[queries[0]] !== null)
		console.log('🌧 CryptoStats', collection, queries, args, metadata, protocols)
		return protocols
	} catch (error) {
		return null
	}
}
Helpers.loadCryptoStatsCache = async (collection, queries, args = [], metadata = true) => {
	try {
		// await caches.delete('crypto-stats')

		let cache = await caches.open('crypto-stats')
		let url = Helpers.cryptostatsURL(collection, queries, args, metadata)

		let response = await cache.match(url)
		if (response) {
			let result = await response.json()
			let cacheDuration = metadata ? 1000 * 60 * 5 : 1000 * 60 * 60
			if (result._cachedAt > new Date().getTime() - cacheDuration) {
				console.log('🪣 CryptoStats', collection, queries, args, metadata, result)
				return result.protocols
			}
		}

		let protocols = await Helpers.loadCryptoStats(collection, queries, args, metadata)
		if (protocols) {
			let result = { protocols, _cachedAt: new Date().getTime() }
			cache.put(url, new Response(JSON.stringify(result)))
		}
		return protocols

	} catch (error) {
		return Helpers.loadCryptoStats(collection, queries, args, metadata)
	}
}
Helpers.loadCryptoStatsAggregatedDates = async (collection, query, dates = [Helpers.date(moment().subtract(1, 'days'))]) => {
	try {
		let queryFunc = async (d) => { return await Helpers.loadCryptoStatsCache(collection, [query], [d], d == dates[dates.length - 1]) }
		let queryFuncWithRetry = async (d) => {
			let result = await queryFunc(d)
			if (result == null) result = await queryFunc(d)
			return result
		}
		let results = await Promise.all(dates.map(queryFuncWithRetry))
		// console.log('raw data', dates, results)

		let result = results[results.length - 1]
		result.forEach(protocol => {
			let values = results.map(res => {
				if (!res) return null
				let p = res.find(p => p.id === protocol.id)
				if (p) return p.results[query]
				else return null
			})
			protocol.results[query + '_aggregated'] = values
		})
		return result

	} catch (error) {
		console.log(error)
		return null
	}
}

Helpers.protocolChains = (protocol) => {
	return (protocol.metadata.blockchain ? [protocol.metadata.blockchain] : (protocol.protocols || []).map(protocol => protocol.metadata.blockchain).filter(Helpers.unique).filter(c => !!c))
}
Helpers.isChain = (protocol) => {
	return ['l1', 'l2'].includes((protocol.metadata.category || '').toLowerCase())
}

Helpers.getBundledProtocols = function (protocols, attributesToBundle = [], arrayAttributesToBundle = []) {
	let bundles = []
	protocols.forEach(protocol => {
		protocol.bundle = (protocol.bundle || protocol.id)
		let bundle = bundles.find(bundle => bundle.id === protocol.bundle)
		if (!bundle) {
			bundle = {
				id: protocol.bundle,
				protocols: [],
				metadata: {
					name: protocol.metadata.name,
					icon: protocol.metadata.icon,
					website: protocol.metadata.website,
					category: protocol.metadata.category,
					source: protocol.metadata.source,
					feeDescription: protocol.metadata.feeDescription,
				},
				results: {},
			}
			attributesToBundle.forEach(attribute => bundle.results[attribute] = 0)
			arrayAttributesToBundle.forEach(arrayAttribute => bundle.results[arrayAttribute] = protocol.results[arrayAttribute].map(_ => 0))
			bundles.push(bundle)
		}
		bundle.protocols.push(protocol)
		attributesToBundle.forEach(attribute => bundle.results[attribute] += protocol.results[attribute])
		arrayAttributesToBundle.forEach(arrayAttribute => bundle.results[arrayAttribute].forEach((v, i) => bundle.results[arrayAttribute][i] += protocol.results[arrayAttribute][i]))
	})
	// console.log(bundles);
	return bundles
}




Helpers.Header = function (props) {
	return <>
		<div className='row'>
			<div className='col-md mb-4'>
				<div className="h2 fw-light">{props.title}</div>
				<div className='small opacity-50'>{props.subtitle}</div>
			</div>
			{props.children && <div className='col-md-auto mb-4 text-end'>{props.children}</div>}
		</div>
	</>
}

Helpers.Loading = function (props) {
	return <div className='text-center my-5 py-5 opacity-25'><Spinner animation="border" variant="black" /></div>
}
Helpers.Error = function (props) {
	return <div className='text-center my-5 py-5 opacity-25 fw-500'><div><i className='bi bi-exclamation-circle-fill'></i></div><div>Error loading data</div></div>
}



Helpers.Icon = function (props) {
	return (
		<img style={{ height: '1.3em', width: '1.3em', objectFit: 'contain', verticalAlign: '-0.25em' }} {...props} />
	)
}
Helpers.ProtocolIconName = function (props) {
	return (
		<span className='text-nowrap'>
			<Helpers.Icon src={props.protocol.metadata.icon} className={props.imgClass || 'me-3'} />
			<span className='fw-500 me-1 '>{props.protocol.metadata.name}</span>
			{!props.hideSubtitle && props.protocol.metadata.subtitle && <span className='opacity-50 me-2 small'>{props.protocol.metadata.subtitle}</span>}
			{!props.hideChainFlag && Helpers.isChain(props.protocol) && <i className='bi bi-link-45deg' title='Chain'></i>}
		</span>
	)
}

Helpers.currency = function (number, decimals = 0) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: decimals }).format(number)
}
Helpers.number = function (number, decimals = 0) {
	return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: decimals }).format(number)
}
Helpers.percent = function (number, decimals = 2) {
	return (number * 100).toFixed(decimals) + '%'
}
Helpers.date = function (date) {
	return moment(date).format('YYYY-MM-DD')
}

Helpers.filterOverlay = function (title, listFunc, filterItems, setFilterItemsFunc, itemDisplayFunc, trigger) {
	function resetFilterItems() { setFilterItemsFunc([]) }
	let toggleFilterItem = function (item, status) {
		setFilterItemsFunc(status ? filterItems.concat(item) : filterItems.filter(c => c !== item))
	}

	return (
		<OverlayTrigger
			trigger="click"
			placement="bottom"
			rootClose={true}
			overlay={
				<Popover className="shadow">
					<Popover.Body>
						{filterItems.length > 0 ? <span role="button" className='float-end fw-bold small text-primary' onClick={resetFilterItems}>×</span> : ''}
						<div className="h6 mb-3 text-nowrap pe-4">{title}</div>
						{listFunc().map(item =>
							<Form.Check type="checkbox" label={itemDisplayFunc ? itemDisplayFunc(item) : item} key={item}
								checked={filterItems.includes(item)} onChange={(e) => toggleFilterItem(item, e.target.checked)} />
						)}
					</Popover.Body>
				</Popover>
			}
		>
			{trigger}
		</OverlayTrigger>
	)
}

Helpers.FilterToolbarButton = function ({ title, listFunc, filterItems, setFilterItemsFunc, itemDisplayFunc = (i => i), className }) {
	let combinedFilterItems = filterItems.join(', ')
	return Helpers.filterOverlay(title, listFunc, filterItems, setFilterItemsFunc, itemDisplayFunc, (
		<Button variant="light" size='sm' className={(className || '') + (filterItems.length > 0 ? ' ' : ' text-muted')}>
			<span className='text-nowrap'><i className={"bi bi-funnel-fill small ms-1x " + (filterItems.length > 0 ? 'text-primary' : 'opacity-25')}></i> {title}</span>
			<span className='fw-500'>{filterItems.length > 0 && (': ' + itemDisplayFunc(combinedFilterItems))}</span>
		</Button>
	))
}

Helpers.BoolToolbarButton = function (props) {
	return (
		<Button variant="light" size='sm' className={(props.className || '') + (props.selected ? ' ' : ' text-muted')} onClick={() => { props.onChange(!props.selected) }}>
			<i className={"small bi  " + (props.selected ? 'bi-check-square-fill text-primary ' : 'bi-square opacity-25')}></i> {props.title}
		</Button>
	)
}
Helpers.DateToolbarButton = function (props) {
	return <div className='d-inline-block'>
		<DatePicker maxDate={moment().subtract(1, 'days').toDate()} {...props} customInput={
			<Button variant="light" size='sm'><i className='bi bi-calendar-event text-primary'></i> {Helpers.date(props.selected)}</Button>
		} />
	</div>
}




const ExpandableRow = function (props) {
	const [expanded, setExpanded] = useState(null);
	return (
		<>
			<tr className={(expanded ? 'border-white' : '')}>
				{props.children}
				<td className="text-end" style={{ width: '1em' }}>
					<i role='button' className={'small opacity-50 bi ' + (expanded ? 'bi-chevron-up' : 'bi-chevron-down')} onClick={() => setExpanded(!expanded)}></i>
				</td>
			</tr>
			{expanded &&
				<>
					{props.expandedRows}
					<tr >
						<td colSpan={100} className='p-0'>
							<div className='overflow-hidden'>
								<div className='bg-light text-muted p-3' >
									{props.expandedContent}
								</div>
							</div>
						</td>
					</tr>
				</>
			}
		</>
	)
}
Helpers.ExpandableRow = ExpandableRow

Helpers.StandardExpandedContent = function ({ protocol }) {
	return <>
		{Helpers.protocolChains(protocol).length > 0 && <div className='small'><span className='opacity-50'>Chain:</span> {Helpers.protocolChains(protocol).join(', ')}</div>}
		{protocol.metadata.category && <div className='small'><span className='opacity-50'>Category:</span> <span className='text-uppercase'>{protocol.metadata.category}</span></div>}
		{protocol.metadata.source && <div className='small'><span className='opacity-50'>Data Source:</span> {protocol.metadata.source}</div>}
		{protocol.metadata.website && <div className='small'><span className='opacity-50'>Website:</span> <a href={protocol.metadata.website} target='_blank' className=''>{protocol.metadata.website}</a></div>}
	</>
}

Helpers.ProtocolsRows = function ({ protocols, protocolCellsFunc, expandedRowsFunc, expandedContentFunc }) {
	return (<>
		{protocols && protocols.map((protocol, index) => {
			let expandedRows = (expandedRowsFunc && expandedRowsFunc(protocol)) || <>
				{(protocol.protocols && protocol.protocols.length > 1 ? protocol.protocols : []).map((protocol) =>
					<tr className='border-light bg-light small' key={protocol.id}>
						{protocolCellsFunc(protocol)}
						<td></td>
					</tr>
				)}
			</>
			let expandedContent = (expandedContentFunc && expandedContentFunc(protocol)) || <Helpers.StandardExpandedContent protocol={protocol} />
			return (
				<Helpers.ExpandableRow expandedContent={expandedContent} expandedRows={expandedRows} key={protocol.id}>
					{protocolCellsFunc(protocol)}
				</Helpers.ExpandableRow>
			)
		})}

	</>)
}
Helpers.ProtocolsTable = function (props) {
	return (<>
		<Table responsive className=" ">
			<thead>
				<tr className='fw-normal small'>
					{props.headerCells}
					<th ></th>
				</tr>
			</thead>
			<tbody>
				<Helpers.ProtocolsRows {...props} />
			</tbody>
		</Table>
	</>)
}


export default Helpers;

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
		console.log('🌧 CryptoStats', collection, queries, args, protocols)
		return protocols
	} catch (error) {
		return null
	}
}




Helpers.Header = function (props) {
	return <>
		<div className="h2 fw-light">{props.title}</div>
		<div className='opacity-50'>{props.subtitle}</div>
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
			<Helpers.Icon src={props.protocol.metadata.icon} className='me-3' />
			<span className='fw-500 me-1 '>{props.protocol.metadata.name}</span>
			{props.protocol.metadata.subtitle && <span className='opacity-50 me-2 small'>{props.protocol.metadata.subtitle}</span>}
		</span>
	)
}

Helpers.currency = function (number, decimals = 0) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: decimals }).format(number)
}
Helpers.number = function (number, decimals = 0) {
	return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: decimals }).format(number)
}
Helpers.percent = function (number) {
	return (number * 100).toFixed(2) + '%'
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
						{filterItems.length > 0 ? <span role="button" className='float-end small text-primary' onClick={resetFilterItems}>RESET</span> : ''}
						<div className="h6 mb-3">{title}</div>
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

Helpers.FilterToolbarButton = function ({ title, listFunc, filterItems, setFilterItemsFunc, itemDisplayFunc }) {
	let combinedFilterItems = filterItems.join(', ')
	return Helpers.filterOverlay(title, listFunc, filterItems, setFilterItemsFunc, itemDisplayFunc, (
		<Button variant="light" size='sm' className={(filterItems.length > 0 ? '' : 'text-muted')}>
			<i className={"bi bi-funnel-fill small ms-1x " + (filterItems.length > 0 ? 'text-primary' : 'opacity-25')}></i> {filterItems.length == 0 ? title : itemDisplayFunc ? itemDisplayFunc(combinedFilterItems) : combinedFilterItems}
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
	return (
		<DatePicker maxDate={moment().subtract(1, 'days').toDate()} {...props} customInput={
			<Button variant="light" size='sm'><i className='bi bi-calendar-event text-primary'></i> {Helpers.date(props.selected)}</Button>
		} />
	)
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
		{protocol.metadata.blockchain && <div className='small'><span className='opacity-50'>Chain:</span> {protocol.metadata.blockchain}</div>}
		{protocol.metadata.category && <div className='small'><span className='opacity-50'>Category:</span> <span className='text-uppercase'>{protocol.metadata.category}</span></div>}
		{protocol.metadata.source && <div className='small'><span className='opacity-50'>Data Source:</span> {protocol.metadata.source}</div>}
		{protocol.metadata.website && <div className='small'><span className='opacity-50'>Website:</span> <a href={protocol.metadata.website} target='_blank' className=''>{protocol.metadata.website}</a></div>}
	</>
}



export default Helpers;

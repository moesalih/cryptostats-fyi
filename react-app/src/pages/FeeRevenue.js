import React, { useState, useEffect, forwardRef } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, ButtonGroup, OverlayTrigger, Form, Table, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')






export default function () {

	const [view, setView] = useState('list');
	const [protocols, setProtocols] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState([]);
	const [chainFilter, setChainFilter] = useState([]);
	const [bundled, setBundled] = useState(true);
	const [date, setDate] = useState(moment().subtract(1, 'days').toDate());

	async function fetchData() {
		// let protocols = await Helpers.loadCryptoStats('fees', ['oneDayTotalFees'], [Helpers.date(date)])
		let protocols = await Helpers.loadCryptoStatsAggregatedDates('fees', 'oneDayTotalFees', 7, Helpers.date(date))
		if (protocols) {
			protocols = protocols.map(p => {
				let values = p.results['oneDayTotalFees_7days'].filter(v => v !== null)
				p.results['oneDayTotalFees_7days_avg'] = values.reduce((a, b) => a + b, 0) / values.length
				return p
			})
			protocols = protocols.filter(protocol => protocol.results.oneDayTotalFees !== null && protocol.results.oneDayTotalFees > 0);
			protocols = protocols.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
			protocols.forEach(protocol => protocol.metadata.blockchain = protocol.metadata.blockchain || 'Other');
		}
		console.log(protocols)
		setProtocols(protocols)
	}

	let chainIcon = function (chain) {
		let protocol = protocols.find(protocol => protocol.metadata.name === chain)
		return protocol ? protocol.metadata.icon : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
	}
	let getCategories = function () { return protocols.map(protocol => protocol.metadata.category).filter(Helpers.unique) }
	let getChains = function () { return protocols.map(protocol => protocol.metadata.blockchain).filter(Helpers.unique) }


	let getFilteredProtocols = function () {
		let items = protocols
		if (categoryFilter.length > 0) items = items.filter(protocol => categoryFilter.includes(protocol.metadata.category))
		if (chainFilter.length > 0) items = items.filter(protocol => chainFilter.includes(protocol.metadata.blockchain))
		if (bundled) items = Helpers.getBundledProtocols(items, ['oneDayTotalFees', 'oneDayTotalFees_7days_avg'])
		items = items.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
		return items
	}


	useEffect(() => {
		fetchData()
	}, [date])

	let dateChanged = (date) => {
		setDate(date)
		setProtocols([])
	}



	const ListView = () => {
		return <>
			<div className='text-end mt-4'>
				<ButtonGroup className='ms-2 mb-2'>
					<Helpers.FilterToolbarButton title='Chain' listFunc={getChains} filterItems={chainFilter} setFilterItemsFunc={setChainFilter} />
					<Helpers.FilterToolbarButton title='Category' listFunc={getCategories} filterItems={categoryFilter} setFilterItemsFunc={setCategoryFilter} itemDisplayFunc={item => item.toUpperCase()} />
				</ButtonGroup>
				<Helpers.BoolToolbarButton selected={bundled} onChange={setBundled} title='Bundle' className='ms-2 mb-2' />
				<Helpers.DateToolbarButton selected={date} onChange={dateChanged} className='ms-2 mb-2' />
			</div>
			<Table responsive className="my-4">
				<thead>
					<tr className='fw-normal small'>
						<th ></th>
						<th className="text-end opacity-50 d-none d-md-table-cell">Chain</th>
						<th className="text-end opacity-50 text-nowrap">1 Day Fees</th>
						<th className="text-end opacity-50 text-nowrap">7 Day Avg Fees</th>
						<th ></th>
					</tr>
				</thead>
				<tbody>
					{getFilteredProtocols() && getFilteredProtocols().map((protocol) => {
						const protocolCells = protocol => <>
							<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
							<td className="d-none d-md-table-cell text-end" >
								{Helpers.protocolChains(protocol).map(chain => <Helpers.Icon src={chainIcon(chain)} title={chain} className="smaller ms-1" key={chain} />)}
							</td>
							<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees)}</span></td>
							<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees_7days_avg)}</span></td>
						</>
						const expandedRows = <>
							{(bundled && protocol.protocols.length > 1 ? protocol.protocols : []).map((protocol) =>
								<tr className='border-light bg-light small' key={protocol.id}>
									{protocolCells(protocol)}
									<td></td>
								</tr>
							)}
						</>
						const expandedContent = <>
							<div className='small mb-2'>{protocol.metadata.feeDescription}</div>
							<Helpers.StandardExpandedContent protocol={protocol} />
						</>

						return (
							<Helpers.ExpandableRow expandedContent={expandedContent} expandedRows={expandedRows} key={protocol.id}>
								{protocolCells(protocol)}
							</Helpers.ExpandableRow>
						)
					})}

				</tbody>
			</Table>
		</>
	}

	const ChartView = () => {
		return <>
		</>
	}

	return (
		<>
			{/* <ToggleButtonGroup type="radio" name='view' value={view} className='my-2 float-end'>
				<ToggleButton variant='light' value='list' onClick={() => setView('list')}><i className='bi bi-list-columns' title='List'></i></ToggleButton>
				<ToggleButton variant='light' value='chart' onClick={() => setView('chart')}><i className='bi bi-bar-chart-line-fill' title='Chart'></i></ToggleButton>
			</ToggleButtonGroup> */}

			<Helpers.Header title='Fee Revenue' subtitle='Total fees paid to a protocol on a given day.' />


			{protocols && protocols.length == 0 && <Helpers.Loading />}
			{!protocols && <Helpers.Error />}

			{protocols && protocols.length > 0 &&
				<>
					{/* {view == 'list' && <ListView />} */}
					{/* {view == 'chart' && <ChartView />} */}
					<ListView />
				</>

			}

		</>
	);
}



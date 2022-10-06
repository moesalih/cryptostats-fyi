import React, { useState, useEffect, forwardRef } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, DropdownButton, NavItem, NavLink, Spinner, Button, ButtonGroup, OverlayTrigger, Form, Table, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

import Helpers from '../Helpers';




const axios = require('axios').default;
const moment = require('moment')




function pastDates(date, pastDays) {
	return new Array(pastDays).fill(0).map((_, i) => moment(date).subtract(pastDays - i - 1, 'days').format('YYYY-MM-DD'))
}

export default function () {

	const [view, setView] = useState('list');
	const [protocols, setProtocols] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState([]);
	const [chainFilter, setChainFilter] = useState([]);
	const [bundled, setBundled] = useState(true);
	const [date, setDate] = useState(moment().subtract(1, 'days').toDate());
	const [pastDays, setPastDays] = useState(7);



	async function fetchData() {
		// let protocols = await Helpers.loadCryptoStats('fees', ['oneDayTotalFees'], [Helpers.date(date)])
		let protocols = await Helpers.loadCryptoStatsAggregatedDates('fees', 'oneDayTotalFees', pastDates(date, pastDays))
		if (protocols) {
			protocols = protocols.map(p => {
				p.results['oneDayTotalFees_7days'] = p.results['oneDayTotalFees_aggregated'].slice(-7)
				let values = p.results['oneDayTotalFees_7days'].filter(v => v !== null)
				p.results['oneDayTotalFees_7days_avg'] = values.reduce((a, b) => a + b, 0) / values.length
				return p
			})
			protocols = protocols.filter(protocol => protocol.results.oneDayTotalFees !== null && protocol.results.oneDayTotalFees > 0);
			protocols = protocols.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
			protocols.forEach(protocol => protocol.metadata.blockchain = protocol.metadata.blockchain || 'Other');
		}
		console.log('protocols', protocols)
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
		if (bundled) items = Helpers.getBundledProtocols(items, ['oneDayTotalFees', 'oneDayTotalFees_7days_avg'], ['oneDayTotalFees_7days', 'oneDayTotalFees_aggregated'])
		items = items.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
		return items
	}


	useEffect(() => {
		fetchData()
	}, [date, pastDays])

	let dateChanged = (date) => {
		setDate(date)
		setProtocols([])
	}



	const ListView = () => {

		const headerCells = <>
			<th ></th>
			<th className="text-end opacity-50 d-none d-md-table-cell">Chain</th>
			<th className="text-end opacity-50 text-nowrap">1 Day Fees</th>
			<th className="text-end opacity-50 text-nowrap">7 Day Avg Fees</th>
		</>
		const protocolCellsFunc = protocol => <>
			<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
			<td className="d-none d-md-table-cell text-end" >
				{Helpers.protocolChains(protocol).map(chain => <Helpers.Icon src={chainIcon(chain)} title={chain} className="smaller ms-1" key={chain} />)}
			</td>
			<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees)}</span></td>
			<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees_7days_avg)}</span></td>
		</>
		const expandedContentFunc = protocol => <>
			<div className='small mb-2'>{protocol.metadata.feeDescription}</div>
			<Helpers.StandardExpandedContent protocol={protocol} />
		</>

		return <Helpers.ProtocolsTable {...{ headerCells, protocolCellsFunc, expandedContentFunc, protocols: getFilteredProtocols() }} />
	}

	const ChartView = () => {

		useEffect(() => {
			// console.log('chart view');
			setPastDays(30)
		}, [])


		let filteredProtocols = getFilteredProtocols()
		const [selectedProtocolsIds, setSelectedProtocolsIds] = useState([filteredProtocols[0].id]);
		let selectedProtocols = filteredProtocols.filter(p => selectedProtocolsIds.includes(p.id))

		let loadedDays = selectedProtocols[0].results['oneDayTotalFees_aggregated'].length
		let dates = pastDates(date, loadedDays)

		// console.log(selectedProtocols);


		const options = {
			maintainAspectRatio: false,
			responsive: true,
			animation: {
				duration: 0,
			},
			animations: [],
			plugins: {
				legend: {
					display: false,
				},
				// title: {
				// 	display: true,
				// 	text: 'Chart.js Bar Chart',
				// },
			},
		}

		const data = {
			labels: dates,
			datasets: selectedProtocols.map((p, i) => ({
				label: p.metadata.name,
				data: [...p.results['oneDayTotalFees_aggregated']],
				backgroundColor: 'rgba(0,0,0, 0.8)',
			})),
		}

		return <>
			<div className=' my-4'>
				<Dropdown className='d-inline-block'>
					<Dropdown.Toggle variant="light" size='smx' id="protocol">
						<Helpers.ProtocolIconName protocol={selectedProtocols[0]} imgClass='me-2' /> &nbsp;
					</Dropdown.Toggle>
					<Dropdown.Menu className='shadow'>
						{filteredProtocols && filteredProtocols.map(p => <Dropdown.Item className='small' onClick={() => setSelectedProtocolsIds([p.id])} key={p.id} ><Helpers.ProtocolIconName protocol={p} imgClass='me-2' /></Dropdown.Item>)}
					</Dropdown.Menu>
				</Dropdown>

				{/* <DropdownButton variant="light" size='smx' id="protocol" title={<><Helpers.ProtocolIconName protocol={selectedProtocols[0]} imgClass='me-2' /> &nbsp;</>}>
					{filteredProtocols && filteredProtocols.map(p => <Dropdown.Item className='small' onClick={() => setSelectedProtocols([p])} key={p.id} ><Helpers.ProtocolIconName protocol={p} imgClass='me-2' /></Dropdown.Item>)}
				</DropdownButton> */}
				{loadedDays < pastDays && <div className='d-inline-block opacity-25 ms-4 smaller'><Spinner animation="border" variant="black" size='sm' className='me-1 align-text-bottom' /> Loading more historical data...</div>}
			</div>
			<div className="ratio ratio-16x9">
				<Bar options={options} data={data} />
			</div>

		</>
	}

	return (
		<>
			<div className='row'>
				<div className='col-md-5'>
					<Helpers.Header title='Fee Revenue' subtitle='Total fees paid to a protocol in a day.' />

				</div>
				<div className='col-md-7'>
					{protocols && protocols.length > 0 &&
						<>
							<div className='text-end '>
								<Helpers.FilterToolbarButton title='Chain' listFunc={getChains} filterItems={chainFilter} setFilterItemsFunc={setChainFilter} className='ms-2 mb-2' />
								<Helpers.FilterToolbarButton title='Category' listFunc={getCategories} filterItems={categoryFilter} setFilterItemsFunc={setCategoryFilter} itemDisplayFunc={item => item.toUpperCase()} className='ms-2 mb-2' />
								<Helpers.BoolToolbarButton selected={bundled} onChange={setBundled} title='Bundle' className='ms-2 mb-2' />
								<Helpers.DateToolbarButton selected={date} onChange={dateChanged} className='ms-2 mb-2' />
								<ToggleButtonGroup type="radio" name='view' value={view} className='ms-2 mb-2'>
									<ToggleButton variant='light' size='sm' value='xlist' className={view == 'list' ? 'text-primary' : 'text-muted'} onClick={() => setView('list')}><i className='bi bi-list-columns' title='List'></i></ToggleButton>
									<ToggleButton variant='light' size='sm' value='xchart' className={view == 'chart' ? 'text-primary' : 'text-muted'} onClick={() => setView('chart')}><i className='bi bi-bar-chart-line-fill' title='Chart'></i></ToggleButton>
								</ToggleButtonGroup>
							</div>
						</>
					}

				</div>
			</div>


			{protocols && protocols.length == 0 && <Helpers.Loading />}
			{!protocols && <Helpers.Error />}

			{protocols && protocols.length > 0 &&
				<>
					{view == 'list' && <ListView />}
					{view == 'chart' && <ChartView />}
				</>
			}

		</>
	);
}



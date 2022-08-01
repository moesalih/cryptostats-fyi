import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')






export default function() {

	const [protocols, setProtocols] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState([]);
	const [chainFilter, setChainFilter] = useState([]);

	async function fetchData() {
		const dateString = moment().subtract(1, 'days').format('YYYY-MM-DD')

		let { data } = await axios.get(Helpers.cryptostatsURL('fees', ['oneDayTotalFees'], [dateString], true))
		data.data = data.data.filter(protocol => protocol.results.oneDayTotalFees !== null);
		data.data = data.data.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
		data.data.forEach(protocol => protocol.metadata.blockchain = protocol.metadata.blockchain || 'Other');

		console.log(data.data);
		setProtocols(data.data);

	}

	let getIconForNetwork = function (network) {
		let protocol = protocols.find(protocol => protocol.metadata.name === network)
		return protocol ? protocol.metadata.icon : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
	}
	let getCategories = function () {
		return protocols.map(protocol => protocol.metadata.category).filter(Helpers.unique)
	}
	let getChains = function () {
		return protocols.map(protocol => protocol.metadata.blockchain).filter(Helpers.unique)
	}

	let toggleCategoryFilter = function (category, status) {
		setCategoryFilter(status ? categoryFilter.concat(category) : categoryFilter.filter(c => c !== category))
	}
	let toggleChainFilter = function (chain, status) {
		setChainFilter(status ? chainFilter.concat(chain) : chainFilter.filter(c => c !== chain))
	}

	let getFilteredProtocols = function () {
		let items = protocols
		if (categoryFilter.length > 0) items = items.filter(protocol => categoryFilter.includes(protocol.metadata.category))
		if (chainFilter.length > 0) items = items.filter(protocol => chainFilter.includes(protocol.metadata.blockchain))
		return items
	}


	useEffect(() => {
		fetchData()
	}, [])


	return (
		<>
			<div className="h2 fw-light">Fee Revenue</div>
			<div className='opacity-50'>Total fees paid to a protocol on a given day.</div>

			{protocols.length == 0 && <div className='text-center'><Spinner animation="border" variant="secondary" className="my-5" /></div>}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th ></th>
							<th ></th>
							<th className="text-center text-nowrap"><span className='opacity-50'>Chain</span> {filterIcon('Chain', getChains, chainFilter, toggleChainFilter, setChainFilter)}</th>
							<th ><span className='opacity-50'>Category</span> {filterIcon('Category', getCategories, categoryFilter, toggleCategoryFilter, setCategoryFilter, item => item.toUpperCase())}</th>
							<th ></th>
							<th className="text-end opacity-50">1 Day Fees</th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							return (
								<tr key={index}>
									<td className="text-center" ><Helpers.Icon src={protocol.metadata.icon} /></td>
									<td ><span className='fw-500'>{protocol.metadata.name}</span> <span className='opacity-50'>{protocol.metadata.subtitle}</span></td>
									<td className="text-center" ><Helpers.Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} className="smaller" /></td>
									<td ><span className='text-uppercase small '>{protocol.metadata.category}</span></td>
									<td ></td>
									<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees)}</span></td>
								</tr>
							)
						})}

					</tbody>
				</Table>
			}

		</>
	);
}

function filterIcon(title, listFunc, filterItems, toggleFunc, setFilterItemsFunc, itemDisplayFunc) {
	function resetFilterItems() {
		setFilterItemsFunc([])
	}
	return (
		<OverlayTrigger
			trigger="click"
			placement="bottom"
			rootClose={true}
			overlay={
				<Popover className="shadow">
					<Popover.Body>
						{filterItems.length>0 ? <span role="button" className='float-end small text-primary' onClick={resetFilterItems}>RESET</span> : ''}
						<div className="h6 mb-3">{title}</div>
						{listFunc().map(item =>
							<Form.Check type="checkbox" label={itemDisplayFunc ? itemDisplayFunc(item) : item} key={item} checked={filterItems.includes(item)} onChange={(e) => toggleFunc(item, e.target.checked)} />
						)}
					</Popover.Body>
				</Popover>
			}
		>
			<i className={"bi bi-funnel-fill small ms-1 "+(filterItems.length>0?'text-primary':'opacity-25')}></i>
		</OverlayTrigger>
	)
}

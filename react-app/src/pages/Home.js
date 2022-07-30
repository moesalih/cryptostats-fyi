import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form } from 'react-bootstrap';

const axios = require('axios').default;

const unique = (value, index, self) => {
	return self.indexOf(value) === index
}




export default function Home() {

	const [protocols, setProtocols] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState([]);
	const [chainFilter, setChainFilter] = useState([]);


	let getIconForNetwork = function (network) {
		let protocol = protocols.find(protocol => protocol.metadata.name === network)
		return protocol ? protocol.metadata.icon : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
	}
	let getCategories = function () {
		return protocols.map(protocol => protocol.metadata.category).filter(unique)
	}
	let getChains = function () {
		return protocols.map(protocol => protocol.metadata.blockchain).filter(unique)
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
		async function fetchData() {
			let { data } = await axios.get('https://api.cryptostats.community/api/v1/fees/oneDayTotalFees/2022-07-28?metadata=true')
			data.data = data.data.filter(protocol => protocol.results.oneDayTotalFees !== null);
			data.data = data.data.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
			data.data.forEach(protocol => protocol.metadata.blockchain = protocol.metadata.blockchain || protocol.metadata.name);

			console.log(data.data);
			setProtocols(data.data);

		}
		fetchData()
	}, [])

	function filterIcon(title, listFunc, filterItems, toggleFunc, itemDisplayFunc) {
		return (
			<OverlayTrigger
				trigger="click"
				placement="bottom"
				rootClose={true}
				overlay={
					<Popover className="shadow">
						<Popover.Body>
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

	return (
		<>

			<div className="h2 my-4 "><span className='fw-800 '>CryptoStats.FYI</span> <span className='fw-light ms-4'>Fee Revenue</span></div>

			{protocols.length == 0 && <div className='text-center'><Spinner animation="border" variant="secondary" className="my-5" /></div>}

			{protocols && protocols.length > 0 &&
				<table className="table my-5">
					<thead>
						<tr className='fw-normal small'>
							<th ></th>
							<th ></th>
							<th className="text-center"><span className='opacity-50'>Chain</span> {filterIcon('Chain', getChains, chainFilter, toggleChainFilter)}</th>
							<th ><span className='opacity-50'>Category</span> {filterIcon('Category', getCategories, categoryFilter, toggleCategoryFilter, item => item.toUpperCase())}</th>
							<th ></th>
							<th className="text-end opacity-50">1 Day Fees</th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							return (
								<tr key={index}>
									<td className="text-center" ><Icon src={protocol.metadata.icon} /></td>
									<td ><span className='fw-semibold'>{protocol.metadata.name}</span> <span className='opacity-50'>{protocol.metadata.subtitle}</span></td>
									<td className="text-center" ><Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} /></td>
									<td ><span className='text-uppercase small '>{protocol.metadata.category}</span></td>
									<td ></td>
									<td className="text-end"><span className="font-monospace">{currency(protocol.results.oneDayTotalFees)}</span></td>
								</tr>
							)
						})}

					</tbody>
				</table>
			}

		</>
	);
}

function Icon(props) {
	return props.src ? (
		<img className="align-text-top me-2" style={{ height: '1.3em', width: '1.3em', objectFit: 'contain' }} {...props} />
	) : "";
}

function currency(number) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number);
}

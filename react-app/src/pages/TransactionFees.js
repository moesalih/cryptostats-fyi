import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function() {

	const [protocols, setProtocols] = useState([]);

	async function fetchData() {
		let { data } = await axios.get(Helpers.cryptostatsURL('l2-fees', ['feeTransferEth', 'feeSwap'], [], true))
		data.data = data.data.filter(protocol => protocol.results.feeTransferEth !== null);
		data.data = data.data.sort((a, b) => a.results.feeTransferEth - b.results.feeTransferEth);
		// data.data.forEach(protocol => protocol.metadata.blockchain = protocol.metadata.blockchain || protocol.metadata.name);

		let { data:ethData } = await axios.get(Helpers.cryptostatsURL('l1-fees', ['feeTransferEth', 'feeSwap'], [], true))

		console.log(data.data, ethData.data);
		let protocols = [...data.data, ...ethData.data]
		setProtocols(protocols);
	}

	let getFilteredProtocols = function () {
		let items = protocols
		// if (categoryFilter.length > 0) items = items.filter(protocol => categoryFilter.includes(protocol.metadata.category))
		// if (chainFilter.length > 0) items = items.filter(protocol => chainFilter.includes(protocol.metadata.blockchain))
		return items
	}

	useEffect(() => {
		fetchData()
	}, [])


	return (
		<>
			<div className="h2 fw-light">Transaction Fees</div>
			<div className='opacity-50'>The USD transaction fees for basic transactions on Ethereum layer-2s.</div>

			{protocols.length == 0 && <div className='text-center'><Spinner animation="border" variant="secondary" className="my-5" /></div>}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th style={{width: '2em'}}></th>
							<th ></th>
							{/* <th className="text-center text-nowrap"><span className='opacity-50'>Chain</span> {filterIcon('Chain', getChains, chainFilter, setChainFilter)}</th> */}
							{/* <th ><span className='opacity-50'>Category</span> {filterIcon('Category', getCategories, categoryFilter, setCategoryFilter, item => item.toUpperCase())}</th> */}
							<th ></th>
							<th className="text-end opacity-50">Send ETH</th>
							<th className="text-end opacity-50">Swap Tokens</th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							return (
								<tr key={index}>
									<td className="text-center" ><Helpers.Icon src={protocol.metadata.icon} /></td>
									<td ><span className='fw-500'>{protocol.metadata.name}</span> <span className='opacity-50'>{protocol.metadata.subtitle}</span></td>
									{/* <td className="text-center" ><Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} /></td> */}
									{/* <td ><span className='text-uppercase small '>{protocol.metadata.category}</span></td> */}
									<td ></td>
									<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.feeTransferEth, 2)}</span></td>
									<td className="text-end"><span className="font-monospace">{protocol.results.feeSwap ? Helpers.currency(protocol.results.feeSwap, 2) : '-'}</span></td>
								</tr>
							)
						})}

					</tbody>
				</Table>
			}

		</>
	);
}

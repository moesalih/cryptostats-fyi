import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function() {

	const [protocols, setProtocols] = useState([]);

	async function fetchData() {
		let { data } = await axios.get(Helpers.cryptostatsURL('treasuries', ['currentTreasuryUSD', 'currentLiquidTreasuryUSD'], [], true))
		let protocols = data.data
		protocols = protocols.filter(protocol => protocol.results.currentTreasuryUSD !== null);
		protocols = protocols.sort((a, b) => b.results.currentTreasuryUSD - a.results.currentTreasuryUSD);

		console.log(protocols);
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
			<Helpers.Header title='DAO Treasuries' subtitle='The total value and assets currently held in DAO treasuries.' />

			{protocols.length == 0 && <Helpers.Loading />}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th style={{width: '2em'}}></th>
							<th ></th>
							{/* <th ><span className='opacity-50'>Category</span> </th> */}
							<th className="text-end opacity-50">Total Treasury</th>
							<th className="text-end opacity-50">Liquid Treasury</th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							return (
								<tr key={index}>
									<td className="text-center" ><Helpers.Icon src={protocol.metadata.icon} /></td>
									<td >
										<span className='fw-500'>{protocol.metadata.name}</span> 
										<span className='opacity-50'>{protocol.metadata.subtitle}</span> 
									</td>
									{/* <td ><span className='text-uppercase small '>{protocol.metadata.category}</span></td> */}
									<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.currentTreasuryUSD, 0)}</span></td>
									<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.currentLiquidTreasuryUSD, 0)}</span></td>
								</tr>
							)
						})}

					</tbody>
				</Table>
			}

		</>
	);
}

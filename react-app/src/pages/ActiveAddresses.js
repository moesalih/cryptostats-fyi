import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function() {

	const [protocols, setProtocols] = useState([]);

	async function fetchData() {
		const dateString = moment().subtract(1, 'days').format('YYYY-MM-DD')
		let { data } = await axios.get(Helpers.cryptostatsURL('active-addresses', ['activeAddressesOneDay'], [dateString], true))
		let protocols = data.data
		protocols = protocols.filter(protocol => protocol.results.activeAddressesOneDay !== null);
		protocols = protocols.sort((a, b) => b.results.activeAddressesOneDay - a.results.activeAddressesOneDay);

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
			<Helpers.Header title='Active Addresses' subtitle='Number of addresses that have sent a transaction on a given chain.' />

			{protocols.length == 0 && <Helpers.Loading />}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th style={{width: '2em'}}></th>
							<th ></th>
							<th className="text-end opacity-50">Daily Active Addresses</th>
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
										{protocol.metadata.flags && protocol.metadata.flags.warning ? <i className='bi bi-exclamation-triangle opacity-50 ms-2' title={protocol.metadata.flags.warning}></i> : ''}
										{protocol.metadata.flags && protocol.metadata.flags.throtle ? <i className='bi bi-speedometer2 opacity-50 ms-2' title={protocol.metadata.flags.throtle}></i> : ''}
									</td>
									<td className="text-end"><span className="font-monospace">{Helpers.number(protocol.results.activeAddressesOneDay, 2)}</span></td>
								</tr>
							)
						})}

					</tbody>
				</Table>
			}

		</>
	);
}

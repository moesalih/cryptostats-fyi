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
		let protocols = await Helpers.loadCryptoStats('active-addresses', ['activeAddressesOneDay'], [dateString])
		if (protocols) {
			protocols = protocols.sort((a, b) => b.results.activeAddressesOneDay - a.results.activeAddressesOneDay);
		}
		setProtocols(protocols)
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
							<th ></th>
							<th className="text-end opacity-50">Daily Active Addresses</th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							return (
								<tr key={index}>
									<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
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

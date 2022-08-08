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
		let protocols = await Helpers.loadCryptoStats('tx-count', ['txCountOneDay'], [dateString])
		if (protocols) {
			protocols = protocols.sort((a, b) => b.results.txCountOneDay - a.results.txCountOneDay);
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
			<Helpers.Header title='Transaction Count' subtitle='Number of transactions include on a chain.' />

			{protocols.length == 0 && <Helpers.Loading />}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th ></th>
							<th className="text-end opacity-50">Daily Transaction Count</th>
							<th ></th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							const expandedContent = (
								<>
									{protocol.metadata.source && <div className='small'><span className='opacity-50'>Source:</span> {protocol.metadata.source}</div>}
									{protocol.metadata.website && <div className='small'><span className='opacity-50'>Website:</span> <a href={protocol.metadata.website} target='_blank' className=''>{protocol.metadata.website}</a></div>}
								</>
							)
							return (
								<Helpers.ExpandableRow expandedContent={expandedContent} key={index}>
									<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
									<td className="text-end"><span className="font-monospace">{Helpers.number(protocol.results.txCountOneDay, 2)}</span></td>
								</Helpers.ExpandableRow>
							)
						})}

					</tbody>
				</Table>
			}

		</>
	);
}

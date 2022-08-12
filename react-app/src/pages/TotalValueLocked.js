import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function () {

	const [protocols, setProtocols] = useState([]);
	const [date, setDate] = useState(moment().subtract(1, 'days').toDate());

	async function fetchData() {
		let protocols = await Helpers.loadCryptoStats('tvl', ['totalValueLockedOnDate'], [Helpers.date(date)])
		if (protocols) {
			protocols = protocols.sort((a, b) => b.results.totalValueLockedOnDate - a.results.totalValueLockedOnDate);
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
	}, [date])

	let dateChanged = (date) => {
		setDate(date)
		setProtocols([])
	}


	return (
		<>
			<Helpers.Header title='Total Value Locked' subtitle='Total value locked in a given protocol.' />

			{protocols && protocols.length == 0 && <Helpers.Loading />}
			{!protocols && <Helpers.Error />}

			{protocols && protocols.length > 0 &&
				<>
					<div className='text-end mt-4'>
						<Helpers.DateToolbarButton selected={date} onChange={dateChanged} />
					</div>
					<Table responsive className=" my-4">
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
										<Helpers.StandardExpandedContent protocol={protocol} />
									</>
								)
								return (
									<Helpers.ExpandableRow expandedContent={expandedContent} key={index}>
										<td ><Helpers.ProtocolIconName protocol={protocol} hideChainFlag /></td>
										<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.totalValueLockedOnDate)}</span></td>
									</Helpers.ExpandableRow>
								)
							})}

						</tbody>
					</Table>
				</>
			}

		</>
	);
}

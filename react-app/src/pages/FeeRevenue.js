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
		let protocols = await Helpers.loadCryptoStats('fees', ['oneDayTotalFees'], [dateString])
		if (protocols) {
			protocols = protocols.filter(protocol => protocol.results.oneDayTotalFees !== null && protocol.results.oneDayTotalFees > 0);
			protocols = protocols.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
			protocols.forEach(protocol => protocol.metadata.blockchain = protocol.metadata.blockchain || 'Other');	
		}
		setProtocols(protocols)
	}

	let getIconForNetwork = function (network) {
		let protocol = protocols.find(protocol => protocol.metadata.name === network)
		return protocol ? protocol.metadata.icon : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
	}
	let getCategories = function () { return protocols.map(protocol => protocol.metadata.category).filter(Helpers.unique) }
	let getChains = function () { return protocols.map(protocol => protocol.metadata.blockchain).filter(Helpers.unique) }


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
			<Helpers.Header title='Fee Revenue' subtitle='Total fees paid to a protocol on a given day.' />

			{protocols && protocols.length == 0 && <Helpers.Loading />}
			{!protocols && <Helpers.Error />}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th ></th>
							<th className="text-center text-nowrap"><span className='opacity-50'>Chain</span> {Helpers.filterIcon('Chain', getChains, chainFilter, setChainFilter)}</th>
							<th ><span className='opacity-50'>Category</span> {Helpers.filterIcon('Category', getCategories, categoryFilter, setCategoryFilter, item => item.toUpperCase())}</th>
							<th className="text-end opacity-50">1 Day Fees</th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							return (
								<tr key={index}>
									<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
									<td className="text-center" ><Helpers.Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} className="smaller" /></td>
									<td ><span className='text-uppercase small '>{protocol.metadata.category}</span></td>
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



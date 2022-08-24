import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function () {

	const [protocols, setProtocols] = useState([]);

	async function fetchData() {
		let protocols = await Helpers.loadCryptoStats('treasuries', ['currentTreasuryUSD', 'currentLiquidTreasuryUSD', 'currentTreasuryPortfolio'])
		if (protocols) {
			protocols = protocols.sort((a, b) => b.results.currentTreasuryUSD - a.results.currentTreasuryUSD)
			protocols.forEach(protocol => {
				if (protocol.results.currentTreasuryPortfolio) {
					protocol.results.currentTreasuryPortfolio = protocol.results.currentTreasuryPortfolio.sort((a, b) => b.value - a.value)
					protocol.results.currentTreasuryPortfolio = protocol.results.currentTreasuryPortfolio.filter(asset => asset.value > 1)

				}
			});

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
			<Helpers.Header title='DAO Treasuries' subtitle='The total value and assets currently held in DAO treasuries.' />

			{protocols.length == 0 && <Helpers.Loading />}

			{protocols && protocols.length > 0 &&
				<Table responsive className=" my-5">
					<thead>
						<tr className='fw-normal small'>
							<th ></th>
							<th className="text-end opacity-50">Total Treasury</th>
							<th className="text-end opacity-50">Liquid Treasury</th>
							<th ></th>
						</tr>
					</thead>
					<tbody>
						{getFilteredProtocols() && getFilteredProtocols().map((protocol, index) => {
							const expandedRows = <>
								{protocol.results.currentTreasuryPortfolio && protocol.results.currentTreasuryPortfolio.filter(asset => asset.value > protocol.results.currentTreasuryUSD * 0.01).map((asset, i) =>
									<tr className={'border-light bg-light small ' + (asset.vesting ? 'text-muted' : '')} key={i}>
										<td className=''><Helpers.Icon src={asset.icon} className='me-3' />{asset.name} <span className='opacity-50 small'>{asset.symbol}</span> × {Helpers.number(asset.amount, 2)} {asset.vesting && <span className='text-uppercase rounded-pill badge bg-secondary opacity-50 ms-2'>Unvested</span>}</td>
										<td className="text-end"><span className="font-monospace">{Helpers.currency(asset.value)}</span></td>
										<td className="opacity-50">({Helpers.percent(asset.value / protocol.results.currentTreasuryUSD, 1)})</td>
										<td></td>
									</tr>
								)}
							</>
							const expandedContent = (
								<>
									<Helpers.StandardExpandedContent protocol={protocol} />
								</>
							)
							return (
								<Helpers.ExpandableRow expandedContent={expandedContent} expandedRows={expandedRows} key={index}>
									<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
									<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.currentTreasuryUSD, 0)}</span></td>
									<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.currentLiquidTreasuryUSD, 0)}</span></td>
								</Helpers.ExpandableRow>
							)
						})}

					</tbody>
				</Table>
			}

		</>
	);
}

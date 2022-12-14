import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function () {

	const [protocols, setProtocols] = useState([]);

	async function fetchData() {
		let protocols = await Helpers.loadCryptoStats('l2-fees', ['feeTransferEth', 'feeSwap'])
		if (protocols) {
			protocols = protocols.sort((a, b) => a.results.feeTransferEth - b.results.feeTransferEth);
		}
		let ethProtocol = await Helpers.loadCryptoStats('l1-fees', ['feeTransferEth', 'feeSwap'])
		setProtocols([...protocols, ...ethProtocol])
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



	const headerCells = <>
		<th ></th>
		<th className="text-end opacity-50">Send ETH</th>
		<th className="text-end opacity-50">Swap Tokens</th>
	</>
	const protocolCellsFunc = protocol => <>
		<td >
			<Helpers.ProtocolIconName protocol={protocol} hideChainFlag />
			{protocol.metadata.flags && protocol.metadata.flags.warning ? <i className='bi bi-exclamation-triangle opacity-50 ms-1' title={protocol.metadata.flags.warning}></i> : ''}
			{protocol.metadata.flags && protocol.metadata.flags.throtle ? <i className='bi bi-speedometer2 opacity-50 ms-1' title={protocol.metadata.flags.throtle}></i> : ''}
		</td>
		<td className="text-end"><span className="font-monospace" title={protocol.results.feeTransferEth}>{Helpers.currency(protocol.results.feeTransferEth, 2)}</span></td>
		<td className="text-end"><span className="font-monospace" title={protocol.results.feeSwap}>{protocol.results.feeSwap ? Helpers.currency(protocol.results.feeSwap, 2) : '-'}</span></td>
	</>
	const expandedContentFunc = protocol => <>
		<div className='small mb-2'>{protocol.metadata.description}</div>
		<Helpers.StandardExpandedContent protocol={protocol} />
	</>

	return (
		<>
			<Helpers.Header title='Transaction Fees' subtitle='The USD transaction fees for basic transactions on Ethereum layer-2s.' />

			{protocols.length == 0 && <Helpers.Loading />}

			{protocols && protocols.length > 0 &&
				<Helpers.ProtocolsTable {...{ headerCells, protocolCellsFunc, expandedContentFunc, protocols: getFilteredProtocols() }} />
			}

		</>
	);
}

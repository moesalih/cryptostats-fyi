import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')



export default function () {

	const [protocols, setProtocols] = useState([]);
	const [bundled, setBundled] = useState(true);

	async function fetchData() {
		let protocols = await Helpers.loadCryptoStats('bridged-value', ['currentValueBridgedAToB', 'currentValueBridgedBToA'])
		if (protocols) {
			// console.log(protocols);
			protocols = protocols.flatMap(p => {
				// console.log(p);
				let pA = JSON.parse(JSON.stringify(p))
				let pB = JSON.parse(JSON.stringify(p))
				pA.id = p.id + '-A'
				pA.results.currentValueBridged = p.results.currentValueBridgedAToB
				pB.id = p.id + '-B'
				pB.results.currentValueBridged = p.results.currentValueBridgedBToA
				pB.metadata.chainA = p.metadata.chainB
				pB.metadata.chainAName = p.metadata.chainBName
				pB.metadata.chainB = p.metadata.chainA
				pB.metadata.chainBName = p.metadata.chainAName
				return [pA, pB]
			})
			console.log(protocols);
			protocols = protocols.filter(protocol => protocol.results.currentValueBridged !== null && protocol.results.currentValueBridged > 0)
			protocols = protocols.sort((a, b) => b.results.currentValueBridged - a.results.currentValueBridged)
			protocols.forEach(protocol => {
				protocol.metadata.name = protocol.metadata.name || ''
			})
		}
		setProtocols(protocols)
	}

	let getFilteredProtocols = function () {
		let items = protocols
		// if (categoryFilter.length > 0) items = items.filter(protocol => categoryFilter.includes(protocol.metadata.category))
		// if (chainFilter.length > 0) items = items.filter(protocol => chainFilter.includes(protocol.metadata.blockchain))
		if (bundled) {
			items = Helpers.getBundledProtocols(items, ['currentValueBridged'])
			items.forEach(bundle => {
				if (bundle.protocols.length == 1) {
					bundle.metadata = bundle.protocols[0].metadata
				}
			})
		}
		return items
	}

	useEffect(() => {
		fetchData()
	}, [])


	const headerCells = <>
		<th ></th>
		<th className=" opacity-50"></th>
		<th className=" opacity-50" style={{ width: '1px' }}></th>
		<th className=" opacity-50"></th>
		<th className="text-end opacity-50">Bridged Value</th>
	</>
	const protocolCellsFunc = protocol => <>
		<td ><Helpers.ProtocolIconName protocol={protocol} hideSubtitle hideChainFlag /></td>
		<td className="small align-middle text-nowrap text-end"><span className="opacity-75">{protocol.metadata.chainAName || capitalize(protocol.metadata.chainA)}</span></td>
		<td className="small align-middle px-0 opacity-25">{bundled && protocol.protocols && protocol.protocols.length > 1 ? '...' : <i className='bi bi-arrow-right '></i>}</td>
		<td className="small align-middle text-nowrap "><span className="opacity-75">{protocol.metadata.chainBName || capitalize(protocol.metadata.chainB)}</span></td>
		<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.currentValueBridged)}</span></td>
	</>

	return (
		<>
			<Helpers.Header title='Bridged Value' subtitle='Value locked on various bridges between chains.'>
				{protocols && protocols.length > 0 && <>
					<Helpers.BoolToolbarButton selected={bundled} onChange={setBundled} title='Bundle' className='ms-2 mb-2' />
				</>}
			</Helpers.Header>

			{protocols.length == 0 && <Helpers.Loading />}

			{protocols && protocols.length > 0 && <>
				<Helpers.ProtocolsTable {...{ headerCells, protocolCellsFunc, protocols: getFilteredProtocols() }} />
			</>}

		</>
	)
}

function capitalize(txt) {
	if (!txt) return ''
	return txt.charAt(0).toUpperCase() + txt.substr(1)
}

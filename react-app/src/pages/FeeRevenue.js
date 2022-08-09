import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, ButtonGroup, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';


const axios = require('axios').default;
const moment = require('moment')






export default function () {

	const [protocols, setProtocols] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState([]);
	const [chainFilter, setChainFilter] = useState([]);
	const [bundled, setBundled] = useState(true);

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

	let getBundledProtocols = function (protocols) {
		let bundles = []
		protocols.forEach(protocol => {
			protocol.bundle = (protocol.bundle || protocol.id)
			let bundle = bundles.find(bundle => bundle.id === protocol.bundle)
			if (bundle) {
				bundle.protocols.push(protocol)
				bundle.results.oneDayTotalFees += protocol.results.oneDayTotalFees
			} else {
				let bundle = {
					id: protocol.bundle,
					protocols: [],
					metadata: {
						name: protocol.metadata.name,
						icon: protocol.metadata.icon,
						website: protocol.metadata.website,
						category: protocol.metadata.category,
						source: protocol.metadata.source,
						feeDescription: protocol.metadata.feeDescription,
					},
					results: { oneDayTotalFees: 0 }
				}
				bundle.protocols.push(protocol)
				bundle.results.oneDayTotalFees += protocol.results.oneDayTotalFees
				bundles.push(bundle)
			}
		})
		console.log(bundles);
		return bundles
	}

	let getFilteredProtocols = function () {
		let items = protocols
		if (categoryFilter.length > 0) items = items.filter(protocol => categoryFilter.includes(protocol.metadata.category))
		if (chainFilter.length > 0) items = items.filter(protocol => chainFilter.includes(protocol.metadata.blockchain))
		if (bundled) items = getBundledProtocols(items)
		items = items.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);
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
				<>
					<div className='text-end mt-4'>
						<Button variant="light" size='sm' className={'me-2 ' + (bundled ? '' : 'text-muted')} onClick={() => { setBundled(!bundled) }}>
							<i className={"small bi  " + (bundled ? 'bi-check-square-fill text-primary ' : 'bi-square opacity-25')}></i> Bundle
						</Button>
						<ButtonGroup size="sm" className=''>
							{Helpers.filterButton('Chain', getChains, chainFilter, setChainFilter)}
							{Helpers.filterButton('Category', getCategories, categoryFilter, setCategoryFilter, item => item.toUpperCase())}
						</ButtonGroup>
					</div>
					<Table responsive className="mt-4 mb-5">
						<thead>
							<tr className='fw-normal small'>
								<th ></th>
								<th className="text-end opacity-50 d-none d-md-table-cell">Chain</th>
								{/* <th className=" opacity-50 d-none d-md-table-cell">Category</th> */}
								<th className="text-end opacity-50">1 Day Fees</th>
								<th ></th>
							</tr>
						</thead>
						<tbody>
							{getFilteredProtocols() && getFilteredProtocols().map((protocol) => {
								const expandedContent = (
									<>
										<div className='small mb-2'>{protocol.metadata.feeDescription}</div>
										{protocol.metadata.blockchain && <div className='small'><span className='opacity-50'>Chain:</span> {protocol.metadata.blockchain}</div>}
										{protocol.metadata.category && <div className='small'><span className='opacity-50'>Category:</span> <span className='text-uppercase'>{protocol.metadata.category}</span></div>}
										{protocol.metadata.source && <div className='small'><span className='opacity-50'>Data Source:</span> {protocol.metadata.source}</div>}
										{protocol.metadata.website && <div className='small'><span className='opacity-50'>Website:</span> <a href={protocol.metadata.website} target='_blank' className=''>{protocol.metadata.website}</a></div>}
									</>
								)
								const expandedRows = (
									<>
										{(bundled && protocol.protocols.length > 1 ? protocol.protocols : []).map((protocol) =>
											<tr className='border-light bg-light small'>
												<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
												<td className="d-none d-md-table-cell text-end" >
													<Helpers.Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} className="smaller" />
												</td>
												{/* <td className='d-none d-md-table-cell'><span className='text-uppercase small '>{protocol.metadata.category}</span></td> */}
												<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees)}</span></td>
												<td></td>
											</tr>
										)}
									</>
								)
								return (
									<Helpers.ExpandableRow expandedContent={expandedContent} expandedRows={expandedRows} key={protocol.id}>
										<td ><Helpers.ProtocolIconName protocol={protocol} /></td>
										<td className="d-none d-md-table-cell text-end" >{bundled ? protocol.protocols.map(protocol => protocol.metadata.blockchain).filter(Helpers.unique).map(blockchain =>
											<Helpers.Icon src={getIconForNetwork(blockchain)} title={blockchain} className="smaller me-1" />
										) : (
											<Helpers.Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} className="smaller" />
										)}
										</td>
										{/* <td className='d-none d-md-table-cell'><span className='text-uppercase small '>{protocol.metadata.category}</span></td> */}
										<td className="text-end"><span className="font-monospace">{Helpers.currency(protocol.results.oneDayTotalFees)}</span></td>
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



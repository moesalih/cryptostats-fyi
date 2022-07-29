import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner } from 'react-bootstrap';

const axios = require('axios').default;


export default function Home() {

	const [protocols, setProtocols] = useState([]);

	let getIconForNetwork = function (network) {
		let protocol = protocols.find(protocol => protocol.metadata.name === network)
		return protocol ? protocol.metadata.icon : null
	}

	useEffect(() => {
		async function fetchData() {
			let { data } = await axios.get('https://api.cryptostats.community/api/v1/fees/oneDayTotalFees/2022-07-28?metadata=true')
			data.data = data.data.filter(protocol => protocol.results.oneDayTotalFees !== null);
			data.data = data.data.sort((a, b) => b.results.oneDayTotalFees - a.results.oneDayTotalFees);

			console.log(data.data);
			setProtocols(data.data);

		}
		fetchData()
	}, [])


	return (
		<>

			<div className="h2 my-4 "><span className='fw-bold '>CryptoStats.FYI</span> <span className='fw-light ms-4'>Fee Revenue</span></div>

			{protocols.length == 0 && <div className='text-center'><Spinner animation="border" variant="secondary" className="my-5" /></div>}

			{protocols && protocols.length > 0 &&
				<table className="table my-5">
					<thead>
						<tr className='fw-normal small opacity-50'>
							<th ></th>
							<th ></th>
							<th className="text-center">Chain</th>
							<th >Category</th>
							<th ></th>
							<th className="text-end">1 Day Fees</th>
						</tr>
					</thead>
					<tbody>
						{protocols && protocols.map((protocol, index) => {
							return (
								<tr key={index}>
									<td className="text-center" ><Icon src={protocol.metadata.icon} /></td>
									<td ><span className='fw-semibold'>{protocol.metadata.name}</span> <span className='opacity-50'>{protocol.metadata.subtitle}</span></td>
									<td className="text-center" ><Icon src={getIconForNetwork(protocol.metadata.blockchain)} title={protocol.metadata.blockchain} /></td>
									<td ><span className='text-uppercase small '>{protocol.metadata.category}</span></td>
									<td ></td>
									<td className="text-end"><span className="font-monospace">{currency(protocol.results.oneDayTotalFees)}</span></td>
								</tr>
							)
						})}

					</tbody>
				</table>
			}

		</>
	);
}

function Icon(props) {
	return props.src ? (
		<img className="align-text-top me-2" style={{ height: '1.3em', width: '1.3em', objectFit: 'contain' }} {...props} />
	) : "";
}

function currency(number) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number);
}

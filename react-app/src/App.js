import { Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';
import './App.css';
import "react-datepicker/dist/react-datepicker.css";

import FeeRevenue from './pages/FeeRevenue';
import TotalValueLocked from './pages/TotalValueLocked';
import Issuance from './pages/Issuance';
import TransactionFees from './pages/TransactionFees';
import DAOTreasuries from './pages/DAOTreasuries';
import BridgedValue from './pages/BridgedValue';
import ActiveAddresses from './pages/ActiveAddresses';
import TransactionCount from './pages/TransactionCount';
import Settings from './pages/Settings';


function App() {

	let routes = [
		{ path: '/fee-revenue', component: FeeRevenue, title: '💰  Fee Revenue' },
		{ path: '/tvl', component: TotalValueLocked, title: '🗄  Total Value Locked', hidden: true },
		{ path: '/issuance', component: Issuance, title: '🖨  Issuance' },
		{ path: '/transaction-fees', component: TransactionFees, title: '💳  Transaction Fees' },
		{ path: '/dao-treasuries', component: DAOTreasuries, title: '🏛  DAO Treasuries' },
		{ path: '/bridged-value', component: BridgedValue, title: '⛩  Bridged Value', hidden: true },
		{ path: '/active-addresses', component: ActiveAddresses, title: '👤  Active Addresses' },
		{ path: '/transaction-count', component: TransactionCount, title: '🎟  Transaction Count' },
		{ path: '/settings', component: Settings, hidden: true },
	]

	return (
		<div className="App container-fluid container-xxl">

			<div className="row">
				<div className="col-lg-3 xcol-xxl-2 px-lg-4 xbg-light ">

					<Navbar collapseOnSelect expand="none" className="py-2 py-lg-4 sticky-lg-top">
						<div className="fw-bold h2 my-0">CryptoStats<span className="smaller">.FYI</span></div>
						<Navbar.Toggle className="d-lg-none border-0" />
						<Navbar.Collapse id="basic-navbar-nav " className="d-lg-block min-vh-100x">
							<Nav className="me-auto py-3 py-lg-5 fw-500">
								{routes.filter(r => !r.hidden).map(route => <NavLink className="nav-link" style={{whiteSpace: 'pre'}} to={route.path} key={route.path}>{route.title}</NavLink>)}
							</Nav>
							<div className="opacity-50 smaller lh-lg">
								<div>Data from <a href="https://cryptostats.community" target="_blank" className="text-reset fw-600 text-decoration-none">CryptoStats</a></div>
								<div>Created by <a href="https://twitter.com/0xMoe_" target="_blank" className="text-reset fw-600 text-decoration-none">MOΞ</a></div>
								<hr className="d-lg-none" />
							</div>
						</Navbar.Collapse>
					</Navbar>

				</div>
				<div className="col py-4 px-lg-4">

					<main>
						<Routes>
							<Route path="/" element={<Navigate to="/fee-revenue" />} ></Route>
							{routes.map(route => <Route path={route.path} element={<route.component />} key={route.path} />)}
						</Routes>
					</main>

				</div>
			</div>

		</div>
	);
}

export default App;

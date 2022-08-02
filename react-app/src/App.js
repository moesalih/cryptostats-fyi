import { Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';
import './App.css';

import FeeRevenue from './pages/FeeRevenue';
import Issuance from './pages/Issuance';
import TransactionFees from './pages/TransactionFees';


function App() {
	return (
		<div className="App container">

			<div className="row">
				<div className="col-lg-3">

					<Navbar collapseOnSelect expand="none" className="py-2 py-lg-4 sticky-lg-top">
						<div className="fw-bold h2 my-0">CryptoStats<span className="smaller">.FYI</span></div>
						<Navbar.Toggle className="d-lg-none border-0" />
						<Navbar.Collapse id="basic-navbar-nav " className="d-lg-block">
							<Nav className="me-auto py-3 py-lg-5 fw-500">
								<NavLink className="nav-link" to="/fee-revenue">💰&nbsp;&nbsp;Fee Revenue</NavLink>
								<NavLink className="nav-link" to="/issuance">🖨&nbsp;&nbsp;Issuance</NavLink>
								<NavLink className="nav-link" to="/transaction-fees">💳&nbsp;&nbsp;Transaction Fees</NavLink>
							</Nav>
							<div className="opacity-50 smaller lh-lg">
								<div>Data from <a href="https://cryptostats.community" target="_blank" className="text-reset">CryptoStats</a></div>
								<div>Created by <a href="https://twitter.com/0xMoe_" target="_blank" className="text-reset">MOΞ</a></div>
								<hr className="d-lg-none" />
							</div>
						</Navbar.Collapse>
					</Navbar>

				</div>
				<div className="col py-4">

					<main>
						<Routes>
							<Route path="/" element={<Navigate to="/fee-revenue" />} ></Route>
							<Route path="/fee-revenue" element={<FeeRevenue />} />
							<Route path="/issuance" element={<Issuance />} />
							<Route path="/transaction-fees" element={<TransactionFees />} />
						</Routes>
					</main>

				</div>
			</div>

		</div>
	);
}

export default App;

import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';

import Helpers from '../Helpers';



export default function () {

	const [storageUsed, set_storageUsed] = useState();

	useEffect(() => {
		checkStorage()
	}, [])

	async function checkStorage() {
		if (navigator.storage && navigator.storage.estimate) {
			const quota = await navigator.storage.estimate();
			set_storageUsed(quota.usage)
		}
	}

	async function clearStorage() {
		await caches.delete('crypto-stats')
		await checkStorage()
	}

	return (
		<>
			<Helpers.Header title='Settings' subtitle='' />

			<div className='mt-5'>

				{storageUsed &&
					<div>
						<div className=''>
							<span className='opacity-50'>Storage Used: </span> 
							{(storageUsed / 1000000).toFixed(2)}MB
							<span role='button' className='fw-600  small opacity-25  p-0 ms-3' onClick={() => clearStorage()}><i className='bi bi-trash'></i></span>
						</div>
						
					</div>
				}

			</div>

		</>
	);
}

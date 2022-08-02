import { Container, Navbar, Nav, NavDropdown, Dropdown, NavItem, NavLink, Spinner, Button, Popover, OverlayTrigger, Form, Table } from 'react-bootstrap';


let Helpers = {}

Helpers.unique = (value, index, self) => { return self.indexOf(value) === index }

Helpers.cryptostatsURL = (collection, queries, args, metadata) => {
	let url = 'https://api.cryptostats.community/api/v1/' + collection + '/' + queries.join(',')
	if (args.length > 0) url += '/' + args.join(',')
	url += '?metadata=' + metadata
	return url
}


Helpers.Icon = function(props) {
	return (
		<img className="align-text-top" style={{ height: '1.3em', width: '1.3em', objectFit: 'contain' }} {...props} />
	)
}

Helpers.currency = function(number) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number)
}
Helpers.percent = function(number) {
	return (number*100).toFixed(2) + '%'
}


Helpers.filterIcon = function(title, listFunc, filterItems, setFilterItemsFunc, itemDisplayFunc) {
	function resetFilterItems() { setFilterItemsFunc([]) }
	let toggleFilterItem = function (item, status) {
		setFilterItemsFunc(status ? filterItems.concat(item) : filterItems.filter(c => c !== item))
	}

	return (
		<OverlayTrigger
			trigger="click"
			placement="bottom"
			rootClose={true}
			overlay={
				<Popover className="shadow">
					<Popover.Body>
						{filterItems.length>0 ? <span role="button" className='float-end small text-primary' onClick={resetFilterItems}>RESET</span> : ''}
						<div className="h6 mb-3">{title}</div>
						{listFunc().map(item =>
							<Form.Check type="checkbox" label={itemDisplayFunc ? itemDisplayFunc(item) : item} key={item} checked={filterItems.includes(item)} onChange={(e) => toggleFilterItem(item, e.target.checked)} />
						)}
					</Popover.Body>
				</Popover>
			}
		>
			<i className={"bi bi-funnel-fill small ms-1 "+(filterItems.length>0?'text-primary':'opacity-25')}></i>
		</OverlayTrigger>
	)
}

export default Helpers;

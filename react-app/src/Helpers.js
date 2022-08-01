
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
		<img className="align-text-top me-2" style={{ height: '1.3em', width: '1.3em', objectFit: 'contain' }} {...props} />
	)
}

Helpers.currency = function(number) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number)
}
Helpers.percent = function(number) {
	return (number*100).toFixed(2) + '%'
}


export default Helpers;

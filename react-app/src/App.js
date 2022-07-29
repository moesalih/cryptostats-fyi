import { Routes, Route, Link } from "react-router-dom";
import './App.css';

import Home from './pages/Home';


function App() {
	return (
		<div className="App container">
			{/* <div className="h2 my-4">CryptoStats.FYI</div> */}
			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</div>
	);
}

export default App;

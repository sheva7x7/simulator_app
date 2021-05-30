import './App.css';
import Map from "./components/map";
import Settings from "./components/settings";

function App() {
	return (
		<div className="App">
			<div>
				<h3>
                    Vehicle Simulating
                </h3>
			</div>
            <div>
                <Settings/>
            </div>
			<div style={{ height: "100%", width: "100%" }}>
				<Map zoom={15} center={{ lat: 1.290270, lng: 103.851959 }} />
			</div>
		</div>
	);
}

export default App;

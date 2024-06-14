import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import Login from "./login";
import MenuTest from "./menu_test";
import MenuJugadores from "./menu_jugadores";
import DetalleTest from "./test_view";
import EditTest from "./test_edit";
import CreateTest from "./test_create";
import PlayerSummary from "./player_summary";
import TestSummary from "./test_summary";
import TestGameDetails from "./game_by_test";
import PlayerGameDetails from "./game_by_player";
import Initial from "./initial";
import ErrorPage from "./error";
import PlayAdmin from "./play_admin";
import PlayPlayer from "./play_player";
import "bootstrap/dist/css/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Initial />} />
				<Route path="/login" element={<Login />} />
				<Route path="/menu/test" element={<MenuTest />} />
				<Route path="/menu/players" element={<MenuJugadores />} />
				<Route path="/menu/test/:id" element={<DetalleTest />} />
				<Route path="/menu/test/:id/edit" element={<EditTest />} />
				<Route path="/menu/test/new" element={<CreateTest />} />
				<Route path="/menu/player/:id" element={<PlayerSummary />} />
				<Route path="/menu/test/:id/games" element={<TestSummary />} />
				<Route
					path="/menu/test/:testid/game/:gameid"
					element={<TestGameDetails />}
				/>
				<Route
					path="/menu/player/:id_player/game/:id_game"
					element={<PlayerGameDetails />}
				/>
				<Route path="/error" element={<ErrorPage />} />
				<Route path="/play/:testId/admin" element={<PlayAdmin />} />
				<Route path="/game/:pin/:name" element={<PlayPlayer />} />
				{/* Puedes agregar más rutas según sea necesario */}
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();

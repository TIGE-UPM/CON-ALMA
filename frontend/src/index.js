import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import Login from "./login";
import MenuAssessment from "./menu_assessment";
import MenuJugadores from "./menu_jugadores";
import DetalleAssessment from "./assessment_view";
import EditAssessment from "./assessment_edit";
import CreateAssessment from "./assessment_create";
import PlayerSummary from "./player_summary";
import AssessmentSummary from "./assessment_summary";
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
				<Route path="/menu/assessment" element={<MenuAssessment />} />
				<Route path="/menu/players" element={<MenuJugadores />} />
				<Route path="/menu/assessment/:id" element={<DetalleAssessment />} />
				<Route path="/menu/assessment/:id/edit" element={<EditAssessment />} />
				<Route path="/menu/assessment/new" element={<CreateAssessment />} />
				<Route path="/menu/player/:id" element={<PlayerSummary />} />
				<Route path="/menu/assessment/:id/games" element={<AssessmentSummary />} />
				<Route
					path="/menu/assessment/:assessmentid/game/:gameid"
					element={<TestGameDetails />}
				/>
				<Route
					path="/menu/player/:id_player/game/:id_game"
					element={<PlayerGameDetails />}
				/>
				<Route path="/error" element={<ErrorPage />} />
				<Route path="/play/:assessmentId/admin" element={<PlayAdmin />} />
				<Route path="/game/:pin/:name" element={<PlayPlayer />} />
				{/* Puedes agregar más rutas según sea necesario */}
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();

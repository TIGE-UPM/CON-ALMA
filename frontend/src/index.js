import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import Login from "./login";
import MenuAssessment from "./menu_assessment";
import DetalleAssessment from "./assessment_view";
import EditAssessment from "./assessment_edit";
import CreateAssessment from "./assessment_create";
import AssessmentSummary from "./assessment_summary";
import CreateAssessmentInstance from "./assessmentInstance_create";
import AssessmentInstanceDetails from "./assessmentInstance_view";
import Initial from "./initial";
import ErrorPage from "./error";
import GameAdmin from "./game_admin";
import PlayPlayer from "./play_player";
import "bootstrap/dist/css/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// <React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Initial />} />
				<Route path="/login" element={<Login />} />
				<Route path="/menu/assessment" element={<MenuAssessment />} />
				<Route path="/menu/assessment/:id" element={<DetalleAssessment />} />
				<Route path="/menu/assessment/:id/edit" element={<EditAssessment />} />
				<Route path="/menu/assessment/new" element={<CreateAssessment />} />
				<Route path="/menu/assessment/:id/instance/new" element={<CreateAssessmentInstance />} />
				<Route path="/menu/assessment/:id/instances" element={<AssessmentSummary />} />
				<Route
					path="/menu/assessment-instance/:assessmentInstanceId"
					element={<AssessmentInstanceDetails />}
				/>
				<Route path="/error" element={<ErrorPage />} />
				<Route path="/start/:assessmentInstanceId" element={<GameAdmin />} />
				<Route path="/game" element={<PlayPlayer />} />
				{/* Puedes agregar más rutas según sea necesario */}
			</Routes>
		</BrowserRouter>
	// </React.StrictMode>
);

reportWebVitals();

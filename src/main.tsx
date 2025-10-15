import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cursor animation initialization
window.onload = function () {
	if (typeof window.CursorEffects === "function") {
		new window.CursorEffects({
			shape: "star", // Try 'star', 'circle', 'heart', etc.
			color: "#00bcd4",
			size: 24,
			amount: 16,
			fade: 0.7,
		});
	}
};

createRoot(document.getElementById("root")!).render(<App />);

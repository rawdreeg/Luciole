import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * The main entry point of the application.
 * It renders the root App component into the DOM.
 */
createRoot(document.getElementById("root")!).render(<App />);

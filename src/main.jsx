import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
import { ERROR_CODES, createAppError } from "./utils/errors.js";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw createAppError(ERROR_CODES.APP_ROOT_MISSING);
}

createRoot(rootElement).render(
    <StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </StrictMode>
);

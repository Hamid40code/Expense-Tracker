import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const fontPreconnect = document.createElement("link");
fontPreconnect.rel = "preconnect";
fontPreconnect.href = "https://fonts.googleapis.com";
document.head.appendChild(fontPreconnect);

const fontOriginPreconnect = document.createElement("link");
fontOriginPreconnect.rel = "preconnect";
fontOriginPreconnect.href = "https://fonts.gstatic.com";
fontOriginPreconnect.crossOrigin = "anonymous";
document.head.appendChild(fontOriginPreconnect);

const fontStylesheet = document.createElement("link");
fontStylesheet.rel = "stylesheet";
fontStylesheet.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap";
document.head.appendChild(fontStylesheet);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);

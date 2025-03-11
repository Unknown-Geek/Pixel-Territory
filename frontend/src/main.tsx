import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/styles.css";
import "./styles/patterns.css";
import "./styles/responsive.css";

const rootElement = document.getElementById("root");

// Add error boundary around root render to catch initialization errors
try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: #ff7edb;">Error Loading Pixel Territory</h1>
      <p>There was a problem initializing the application. Please check the console for details.</p>
      <pre style="text-align: left; background: #2c2137; padding: 15px; overflow: auto; margin: 20px auto; max-width: 800px;">${error.toString()}</pre>
      <button onclick="location.reload()" style="background: #ff7edb; color: #0f0a1e; border: none; padding: 8px 16px; cursor: pointer;">Reload Page</button>
    </div>
  `;
}

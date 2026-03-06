import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./features/auth/features.authContext";
import { LobbyProvider } from "./features/lobby/LobbyContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <LobbyProvider>
      <App />
      </LobbyProvider>
    </AuthProvider>
  </BrowserRouter>
);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
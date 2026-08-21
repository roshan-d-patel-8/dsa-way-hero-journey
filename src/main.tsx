import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/press-start-2p";
import { QuestExperience } from "../app/QuestExperience";
import "../app/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QuestExperience />
  </React.StrictMode>,
);

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/press-start-2p";
import { QuestExperience } from "../app/QuestExperience";
import "../app/globals.css";

class JourneyErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The DSA Way could not start", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="boot-screen" role="alert">
          <div className="boot-card">
            <div className="boot-runes" aria-hidden="true">◇ ◇ ◇ ◇ ◇</div>
            <h1>The runes need another moment.</h1>
            <p>The journey could not initialize in this browser session.</p>
            <a href="./">Try the journey again</a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing application root");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <JourneyErrorBoundary>
      <QuestExperience />
    </JourneyErrorBoundary>
  </React.StrictMode>,
);

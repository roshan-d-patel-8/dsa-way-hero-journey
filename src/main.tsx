import React, { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/press-start-2p";
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

function LoadingJourney() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="boot-screen" aria-live="polite">
      <div className="boot-card">
        <div className="boot-runes" aria-hidden="true">◇ ◇ ◇ ◇ ◇</div>
        <h1>The DSA Way</h1>
        <p>{slow ? "The cinematic world is taking longer than expected." : "Loading the cinematic gateway…"}</p>
        <span className="boot-progress">THE TEXT QUEST WILL OPEN FIRST</span>
        {slow && <button type="button" onClick={() => window.location.reload()}>Restart loading</button>}
      </div>
    </main>
  );
}

function StartupFailure() {
  return (
    <main className="boot-screen" role="alert">
      <div className="boot-card">
        <div className="boot-runes" aria-hidden="true">◇ ◇ ◇ ◇ ◇</div>
        <h1>The gateway did not awaken.</h1>
        <p>The cinematic bundle could not be loaded in this browser session.</p>
        <button type="button" onClick={() => window.location.reload()}>Try the journey again</button>
      </div>
    </main>
  );
}

const root = document.getElementById("root");

if (!root) throw new Error("Missing application root");

const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(<LoadingJourney />);

import("../app/QuestExperience")
  .then(({ QuestExperience }) => {
    reactRoot.render(
      <React.StrictMode>
        <JourneyErrorBoundary>
          <QuestExperience />
        </JourneyErrorBoundary>
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    console.error("The DSA Way cinematic bundle could not load", error);
    reactRoot.render(<StartupFailure />);
  });

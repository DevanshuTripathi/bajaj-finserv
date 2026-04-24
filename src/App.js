import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [input, setInput] = useState('["A->B", "A->C", "B->D"]');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async () => {
    setError("");
    setResponse(null);

    try {
      const parsedData = JSON.parse(input);

      const res = await fetch(`${baseUrl}/bfhl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Invalid JSON or API error.");
    }
  };

  const renderTree = (node) => {
    return Object.entries(node).map(([key, value]) => (
      <li key={key}>
        <strong>{key}</strong>
        {Object.keys(value).length > 0 && (
          <ul>{renderTree(value)}</ul>
        )}
      </li>
    ));
  };

  return (
    <div className="container">
      <h1 className="title">Hierarchy Processor</h1>

      <textarea
        rows="4"
        className="textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={handleSubmit} className="button">
        Process
      </button>

      {error && <p className="error">{error}</p>}

      {response && (
        <div className="result-container">
          
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setShowRaw(false)}
              className={showRaw ? "toggle-btn" : "active-toggle"}
            >
              Pretty View
            </button>
            <button
              onClick={() => setShowRaw(true)}
              className={showRaw ? "active-toggle" : "toggle-btn"}
            >
              Raw JSON
            </button>
          </div>

          {showRaw ? (
            <pre className="raw">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <>

              <div className="user-info">
                <div className="card">
                  <h4>User ID</h4>
                  <p>{response.user_id}</p>
                </div>
                <div className="card">
                  <h4>Email</h4>
                  <p>{response.email_id}</p>
                </div>
                <div className="card">
                  <h4>Roll No</h4>
                  <p>{response.college_roll_number}</p>
                </div>
              </div>

              <div className="summary">
                <div className="card">
                  <h4>Total Trees</h4>
                  <p>{response.summary.total_trees}</p>
                </div>
                <div className="card">
                  <h4>Total Cycles</h4>
                  <p>{response.summary.total_cycles}</p>
                </div>
                <div className="card">
                  <h4>Largest Root</h4>
                  <p>{response.summary.largest_tree_root || "-"}</p>
                </div>
              </div>

              {response.hierarchies.map((h, i) => (
                <div key={i} className="tree-card">
                  <h3>Root: {h.root}</h3>

                  {h.has_cycle ? (
                    <p style={{ color: "red" }}>⚠ Cycle detected</p>
                  ) : (
                    <>
                      <p>Depth: {h.depth}</p>
                      <ul>{renderTree(h.tree)}</ul>
                    </>
                  )}
                </div>
              ))}

              <div className="meta">
                <div>
                  <h4>Invalid Entries</h4>
                  <p>{response.invalid_entries.join(", ") || "None"}</p>
                </div>
                <div>
                  <h4>Duplicate Edges</h4>
                  <p>{response.duplicate_edges.join(", ") || "None"}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
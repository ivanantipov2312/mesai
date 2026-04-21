import { useEffect, useState } from "react";

export default function Recommendations() {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    // TODO: replace with POST /ai/recommend
    setRecs([
      {
        text: "Skip Friday party — exam next morning",
        type: "warning"
      },
      {
        text: "Attend AI startup lecture",
        type: "recommendation"
      }
    ]);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Recommendations</h1>

      {recs.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <b>{r.type}:</b> {r.text}
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    setAssignments([
      { id: 1, title: "Math Homework", due: "Friday" },
      { id: 2, title: "ML Project", due: "Monday" }
    ]);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Assignments</h1>

      {assignments.map((a) => (
        <div key={a.id}>
          <b>{a.title}</b> - due {a.due}
        </div>
      ))}
    </div>
  );
}

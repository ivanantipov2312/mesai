import { useEffect, useState } from "react";

export default function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // mock data
    setEvents([
      { id: 1, title: "AI Lecture", time: "10:00" },
      { id: 2, title: "Party", time: "22:00" }
    ]);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Calendar</h1>

      {events.map((e) => (
        <div key={e.id}>
          <b>{e.title}</b> - {e.time}
        </div>
      ))}
    </div>
  );
}

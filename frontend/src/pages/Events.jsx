import { useEffect, useState } from "react";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents([
      { id: 1, title: "Startup Meetup", type: "networking" },
      { id: 2, title: "Hackathon Party", type: "social" }
    ]);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Events</h1>

      {events.map((e) => (
        <div key={e.id}>
          <b>{e.title}</b> ({e.type})
        </div>
      ))}
    </div>
  );
}

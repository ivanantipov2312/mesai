import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Dashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {events.map((e) => (
        <div key={e.id}>
          {e.title} - {e.start_time}
        </div>
      ))}
    </div>
  );
}

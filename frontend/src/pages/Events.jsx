import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { mockEvents } from "../utils/mockEvents";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Campus Events</h1>

      <div className="grid grid-cols-2 gap-6">

        {events.map((e) => (
          <div
            key={e.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{e.title}</h2>
            <p className="text-gray-500">{e.type}</p>
            <p className="mt-3 text-primary font-medium">
              {e.start_time}
            </p>
          </div>
        ))}

      </div>
    </DashboardLayout>
  );
}

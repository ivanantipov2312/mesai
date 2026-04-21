import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { mockEvents } from "../utils/mockEvents";

export default function Dashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-2">
        Hello, Student 👋
      </h1>

      <p className="text-gray-500 mb-8">
        Your academic and career companion.
      </p>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">This Week</h2>

          {events.map((e) => (
            <div key={e.id} className="py-2 border-b">
              {e.title}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Next Milestone</h2>
          <p>Complete ML Project</p>
          <p className="text-sm text-gray-500 mt-2">Due in 3 days</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Burnout Risk</h2>
          <p className="text-3xl font-bold text-orange-500">Medium</p>
        </div>

      </div>
    </DashboardLayout>
  );
}

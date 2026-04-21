import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";

export default function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents([
      {
        id: 1,
        title: "AI Lecture",
        day: "Monday",
        time: "10:00 AM"
      },
      {
        id: 2,
        title: "Study Group",
        day: "Tuesday",
        time: "4:00 PM"
      },
      {
        id: 3,
        title: "Hackathon Party",
        day: "Friday",
        time: "9:00 PM"
      },
      {
        id: 4,
        title: "Project Review",
        day: "Saturday",
        time: "1:00 PM"
      }
    ]);
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-gray-500 mt-2">
          Your weekly schedule overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {event.title}
                </h2>

                <p className="text-gray-500 mt-1">
                  {event.day}
                </p>
              </div>

              <div className="text-primary font-semibold text-lg">
                {event.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    setAssignments([
      {
        id: 1,
        title: "Machine Learning Project",
        due: "Friday",
        priority: "High"
      },
      {
        id: 2,
        title: "Math Homework",
        due: "Saturday",
        priority: "Medium"
      },
      {
        id: 3,
        title: "Database Report",
        due: "Next Monday",
        priority: "Low"
      }
    ]);
  }, []);

  const priorityColor = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-orange-100 text-orange-600",
    Low: "bg-green-100 text-green-600"
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-gray-500 mt-2">
          Track your deadlines and workload.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{a.title}</h2>
                <p className="text-gray-500 mt-1">Due: {a.due}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColor[a.priority]}`}
              >
                {a.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

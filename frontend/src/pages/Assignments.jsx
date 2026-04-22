import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { getAllAssignments } from "../api/assignmentApi.js"; // Import your new wrapper

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAllAssignments();
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Maps your DB "risk_level" to the colors you already defined
  // If your DB uses 'High', 'Medium', 'Low', this works perfectly.
  const priorityColor = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-orange-100 text-orange-600",
    Low: "bg-green-100 text-green-600"
  };

  // Helper to format the ISO date from the backend
  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-gray-500 mt-2">
            Track your deadlines and workload.
          </p>
        </div>
        {/* Refresh button is useful for testing tool calls! */}
        <button 
          onClick={fetchAssignments}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-center py-10">Loading assignments...</p>}
      {error && <p className="text-red-500 text-center py-10">{error}</p>}
      
      {!loading && assignments.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-400">No assignments found. Ask the AI to add one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{a.title}</h2>
                <div className="flex gap-4 mt-1">
                  <p className="text-gray-500">Due: {formatDate(a.due_date)}</p>
                  {a.description && (
                    <p className="text-gray-400 italic">| {a.description}</p>
                  )}
                </div>
              </div>

              {/* risk_level from API maps to priorityColor keys */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColor[a.risk_level] || "bg-gray-100"}`}
              >
                {a.risk_level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import DashBoardLayout from "../layouts/DashboardLayout"
import { getDailyTip } from "../api/aiApi";

export default function Recommendations() {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        setLoading(true);

        const data = await getDailyTip();

        setTip(data);
      } catch (err) {
        setError("Failed to load AI advice");
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, []);

  return (
  <DashBoardLayout>
	<div className="min-h-screen bg-softbg p-8">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          AI Daily Advice
        </h1>

        {/* Loading */}
        {loading && (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            Thinking...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Tip Card */}
        {tip && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-primary">

            <h2 className="text-xl font-semibold mb-2">
              Today's Recommendation
            </h2>

            <p className="text-gray-700">
              {tip.tip || tip}
            </p>

          </div>
        )}

      </div>
    </div>
	  </DashBoardLayout>
  );
}

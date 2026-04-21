import DashboardLayout from "../layouts/DashboardLayout";

export default function Recommendations() {
  const recs = [
    "Skip Friday party — exam next morning",
    "Attend AI lecture — high value",
    "You need 4h study time today"
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        AI Recommendations
      </h1>

      <div className="space-y-4">

        {recs.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-primary"
          >
            {r}
          </div>
        ))}

      </div>
    </DashboardLayout>
  );
}

import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-softbg dark:bg-[#1a1a2e] transition-colors">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto min-h-screen bg-softbg dark:bg-[#1a1a2e]">
        {children}
      </main>
    </div>
  );
}

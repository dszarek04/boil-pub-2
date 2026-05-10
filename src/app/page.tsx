import { SolverView } from "@/components/SolverView";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <SolverView />
      </div>
    </main>
  );
}

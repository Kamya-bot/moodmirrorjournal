import XPProgress from "@/components/XPProgress";

export default function ProgressPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-2">🏆 Progress & Missions</h1>
        <p className="text-muted-foreground mb-6">Track your XP, level, and weekly missions.</p>
        <XPProgress />
      </div>
    </div>
  );
}

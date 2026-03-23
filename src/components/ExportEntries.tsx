import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { JournalEntry } from "@/types/mood";
import { format } from "date-fns";

interface ExportEntriesProps {
  entries: JournalEntry[] | undefined;
}

export default function ExportEntries({ entries }: ExportEntriesProps) {
  if (!entries || entries.length === 0) return null;

  const exportCSV = () => {
    const headers = ["Date", "Mood", "Text", "Tip"];
    const rows = entries.map((e) => [
      format(new Date(e.created_at), "yyyy-MM-dd HH:mm"),
      e.detected_mood,
      `"${e.text.replace(/"/g, '""')}"`,
      `"${(e.tip || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csv, "moodmirror-journal.csv", "text/csv");
  };

  const exportJSON = () => {
    const data = entries.map((e) => ({
      date: e.created_at,
      mood: e.detected_mood,
      text: e.text,
      tip: e.tip,
    }));
    downloadFile(JSON.stringify(data, null, 2), "moodmirror-journal.json", "application/json");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>Export as JSON</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

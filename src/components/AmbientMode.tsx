import { useState, useRef, useEffect } from "react";
import { useCreateEntry } from "@/hooks/useJournal";
import { Button } from "@/components/ui/button";
import { X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AmbientModeProps {
  open: boolean;
  onClose: () => void;
  initialText?: string;
  onTextChange?: (text: string) => void;
}

export default function AmbientMode({ open, onClose, initialText = "", onTextChange }: AmbientModeProps) {
  const [text, setText] = useState(initialText);
  const createEntry = useCreateEntry();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (open) {
      setText(initialText);
      setSeconds(0);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open, initialText]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || createEntry.isPending) return;
    await createEntry.mutateAsync(trimmed);
    onTextChange?.("");
    onClose();
  };

  const handleClose = () => {
    onTextChange?.(text);
    onClose();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"
                animate={{
                  x: ["-10%", "10%", "-10%"],
                  y: ["-10%", "15%", "-10%"],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                style={{ top: "10%", left: "20%" }}
              />
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl"
                animate={{
                  x: ["10%", "-10%", "10%"],
                  y: ["10%", "-15%", "10%"],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                style={{ bottom: "10%", right: "20%" }}
              />
            </div>
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
            <span className="text-sm text-muted-foreground font-mono tabular-nums">
              {formatTime(seconds)}
            </span>
            <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">
              Focus Mode
            </span>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-muted-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Writing area */}
          <div className="relative z-10 w-full max-w-2xl px-6 flex-1 flex flex-col justify-center">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Just write…"
              className="w-full bg-transparent border-none outline-none resize-none text-foreground text-xl md:text-2xl leading-relaxed placeholder:text-muted-foreground/40 font-serif min-h-[40vh] max-h-[60vh]"
              spellCheck
            />
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
            <span className="text-xs text-muted-foreground/50">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <Button
              onClick={handleSend}
              disabled={!text.trim() || createEntry.isPending}
              size="sm"
              className="gap-2"
            >
              {createEntry.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Save Entry
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

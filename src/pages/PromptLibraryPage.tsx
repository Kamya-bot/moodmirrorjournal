import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PromptLibrary from "@/components/PromptLibrary";

export default function PromptLibraryPage() {
  const navigate = useNavigate();
  return (
    <PromptLibrary
      onUsePrompt={(text) => {
        // Store prompt and navigate to journal
        sessionStorage.setItem("moodmirror-use-prompt", text);
        navigate("/");
      }}
    />
  );
}

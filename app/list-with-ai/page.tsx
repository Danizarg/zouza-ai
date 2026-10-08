import { Wizard } from "@/components/wizard/wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List with Suzi",
  description:
    "Add photos and answer a short chat. Suzi writes your listing and you review every word. Create and preview free; €20/month once published.",
};

export default function ListWithAiPage() {
  return <Wizard />;
}

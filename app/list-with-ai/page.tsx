import { Wizard } from "@/components/wizard/wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List with AI",
  description:
    "Upload photos and answer a few quick chat questions — Zouza writes your exposé, FAQ, translations, and switches on your property's AI assistant.",
};

export default function ListWithAiPage() {
  return <Wizard />;
}

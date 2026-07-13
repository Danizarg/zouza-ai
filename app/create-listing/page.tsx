import { Wizard } from "@/components/wizard/wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your AI-generated listing",
  description:
    "Upload photos and answer a few simple questions — Zouza writes your exposé, FAQ, translations and switches on your property's AI assistant.",
};

export default function CreateListingPage() {
  return <Wizard />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Search",
  description: "Tell Zouza what you're looking for in plain language — the AI matches verified homes and explains why.",
};

export default function AiSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

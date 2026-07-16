import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore homes",
  description: "Browse every verified home on Zouza — AI match reasons, real total costs, and a direct line to talk to each property's AI.",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}

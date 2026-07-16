import { Inbox } from "@/components/messages/inbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your conversations with owners and prospective tenants or buyers on Zouza.",
};

export default function DashboardMessagesPage() {
  return <Inbox />;
}

import { Inbox } from "@/components/messages/inbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your conversations with owners and prospective tenants or buyers on Aurora Homes.",
};

export default function MessagesPage() {
  return <Inbox />;
}

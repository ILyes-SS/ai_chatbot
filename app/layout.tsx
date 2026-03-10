import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getConversations } from "@/actions/conversations";

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "A high-fidelity AI chatbot powered by Gemini",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const res = await getConversations();
  const conversations = res.success && Array.isArray(res.data) ? res.data : [];

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar conversations={conversations as any} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

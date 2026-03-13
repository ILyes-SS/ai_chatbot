import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getConversations } from "@/actions/conversations";
import { getProjects } from "@/actions/projects";

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "A high-fidelity AI chatbot powered by Gemini",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [convRes, projRes] = await Promise.all([
    getConversations(),
    getProjects()
  ]);
  const conversations = convRes.success && Array.isArray(convRes.data) ? convRes.data : [];
  const projects = projRes.success && Array.isArray(projRes.data) ? projRes.data : [];

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar conversations={conversations as any} projects={projects as any} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

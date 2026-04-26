import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "../components/Sidebar";
import { getConversations } from "@/actions/conversations";
import { getProjects } from "@/actions/projects";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "../stores/providers";
import SidebarLayout from "../components/SidebarLayout";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <Providers initialConversations={conversations as any} initialProjects={projects as any}>
          <SidebarLayout sidebar={<Sidebar />}>
            {children}
          </SidebarLayout>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "../components/Sidebar";
import { getConversations } from "@/actions/conversations";
import { getProjects } from "@/actions/projects";
import {  Lato } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "../stores/providers";
import SidebarLayout from "../components/SidebarLayout";

const lato = Lato({subsets:['latin'],weight:['400'], variable: "--font-lato"});

export const metadata: Metadata = {
  title: "SailorAI",
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
    <html lang="en" className={cn("font-lato", lato.variable)}>
      <body className="antialiased">
        <Providers initialConversations={conversations} initialProjects={projects}>
          <SidebarLayout sidebar={<Sidebar />}>
            {children}
          </SidebarLayout>
        </Providers>
      </body>
    </html>
  );
}

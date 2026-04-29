"use client";

import React from "react";
import { ToastProvider } from "./toast";
import { ConversationsProvider, type ConversationItem } from "./conversations-store";
import { ProjectsProvider, type ProjectItem } from "./projects-store";

interface ProvidersProps {
  initialConversations: ConversationItem[];
  initialProjects: ProjectItem[];
  children: React.ReactNode;
}

export function Providers({ initialConversations, initialProjects, children }: ProvidersProps) {
  return (
    <ToastProvider>
      <ConversationsProvider initialConversations={initialConversations}>
        <ProjectsProvider initialProjects={initialProjects}>
          {children}
        </ProjectsProvider>
      </ConversationsProvider>
    </ToastProvider>
  );
}

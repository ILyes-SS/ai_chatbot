"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useProjects } from "@/app/stores/projects-store";
import EditProjectModal from "../EditProjectModal";
import type { Project, Conversation } from "@/types";


export type { Project, Conversation };

interface ProjectDetailsProps {
  project: Project;
  conversations: Conversation[];
}

export default function ProjectDetails({ project: initialProject, conversations }: ProjectDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { projects } = useProjects();

  
  const project = projects.find((p) => p._id === initialProject._id) as Project | undefined ?? initialProject;

  const formatRelativeTime = (dateInput: string | Date | null) => {
    if (!dateInput) return "No messages yet";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Unknown date";
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `Last message ${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Last message ${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Last message ${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return `Last message 1 day ago`;
    return `Last message ${diffInDays} days ago`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Back Link */}
      <Link 
        href="/projects" 
        className="text-sm font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

      {/* Project Header */}
      <div className="flex items-start justify-between w-full">
        <div className="group relative w-full">
          <div className="flex justify-between items-start md:block w-full">
            <h1 className="text-4xl font-semibold text-on-surface tracking-tight mb-3 font-serif pr-4 md:pr-0">
              {project.title}
            </h1>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="md:absolute md:-right-10 md:top-2 opacity-100 md:opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all shrink-0 mt-2 md:mt-0"
              aria-label="Edit project"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-base text-on-surface-variant max-w-2xl">
            {project.context || "No description provided."}
          </p>
        </div>
      </div>

      <div className="w-full h-px border-t border-transparent" />

      {/* Conversations List */}
      <div>
        <h2 className="text-xl font-medium text-on-surface mb-6">Conversations</h2>
        
        {conversations.length === 0 ? (
          <div className="bg-surface-container-lowest/50 border border-transparent/50 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <p className="text-on-surface-variant text-sm">No conversations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link 
                href={`/chats/${conversation._id}`} 
                key={conversation._id}
                className="block"
              >
                <div className="bg-primary hover:bg-primary/80 border-y border-transparent/50 -mx-4 px-4 py-4 sm:border sm:rounded-xl sm:mx-0 sm:px-6 hover:border-transparent transition-all cursor-pointer">
                  <h3 className="text-sm font-semibold text-surface mb-1.5">
                    {conversation.title}
                  </h3>
                  <p className="text-xs text-surface">
                    {formatRelativeTime(conversation.updatedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <EditProjectModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        project={project} 
      />
    </div>
  );
}

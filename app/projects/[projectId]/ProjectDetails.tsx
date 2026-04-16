"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import EditProjectModal from "../EditProjectModal";

export interface Project {
  _id: string;
  title: string;
  context?: string;
  userId?: string;
  media?: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Conversation {
  _id: string;
  title: string;
  projectId?: string | null;
  userId?: string;
  createdAt?: string | null;
  updatedAt: string | null;
}

interface ProjectDetailsProps {
  project: Project;
  conversations: Conversation[];
}

export default function ProjectDetails({ project, conversations }: ProjectDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="group relative">
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-3 font-serif">
            {project.title}
          </h1>
          <p className="text-base text-zinc-400 max-w-2xl">
            {project.context || "No description provided."}
          </p>
          
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            aria-label="Edit project"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full h-px border-t border-zinc-800" />

      {/* Conversations List */}
      <div>
        <h2 className="text-xl font-medium text-white mb-6">Conversations</h2>
        
        {conversations.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/50 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <p className="text-zinc-500 text-sm">No conversations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link 
                href={`/chats/${conversation._id}`} 
                key={conversation._id}
                className="block"
              >
                <div className="bg-zinc-950 hover:bg-zinc-900 border-y border-zinc-800/50 -mx-4 px-4 py-4 sm:border sm:rounded-xl sm:mx-0 sm:px-6 hover:border-zinc-700 transition-all cursor-pointer">
                  <h3 className="text-sm font-semibold text-white mb-1.5">
                    {conversation.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
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

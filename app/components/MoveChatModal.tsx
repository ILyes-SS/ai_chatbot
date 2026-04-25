"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/app/stores/conversations-store";

interface Project {
  _id: string;
  title: string;
}

interface MoveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: { _id: string; projectId?: string | null };
  projects: Project[];
}

export default function MoveChatModal({ isOpen, onClose, conversation, projects }: MoveChatModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { optimisticUpdateConversation } = useConversations();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectAssign = (projectId: string | null) => {
    // Optimistic: projectId updates instantly, modal closes
    optimisticUpdateConversation(conversation._id, { projectId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-zinc-50 border border-transparent/50 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Move chat</h2>
            <p className="text-[14px] text-on-surface-variant mt-1">Select a project to move this chat into.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-on-surface-variant hover:text-on-surface-variant/80 hover:bg-zinc-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pb-2">
          <div className="relative group">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant group-focus-within:text-on-surface-variant transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              autoFocus
              className="w-full h-11 pl-10 pr-4 bg-primary-container border border-transparent rounded-t-xl rounded-b-none focus:outline-none focus:border-transparent text-[14px] text-on-surface placeholder:text-on-surface-variant transition-colors"
              placeholder="Search or create a project"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Projects List Container */}
          <div className="border border-t-0 border-transparent rounded-b-xl overflow-hidden bg-primary-container/60 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-variant scrollbar-track-transparent pb-1">
            
            {/* Remove from project option */}
            {conversation.projectId && (
              <button 
                onClick={() => handleProjectAssign(null)}
                className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-left hover:bg-primary-container/80 transition-colors text-on-surface-variant/80 border-b border-transparent"
              >
                <div className="w-[18px] flex justify-center text-on-surface-variant">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </div>
                <span className="text-[14px] font-medium">Remove from project</span>
              </button>
            )}

            {filteredProjects.length === 0 ? (
              <div className="px-4 py-6 text-center text-[14px] text-on-surface-variant">
                No active projects match &quot;{searchQuery}&quot;
              </div>
            ) : (
              <ul className="flex gap-1 flex-col p-1.5">
                {filteredProjects.map(p => {
                  const isAssigned = conversation.projectId === p._id;
                  return (
                    <li key={p._id}>
                      <button
                        onClick={() => handleProjectAssign(p._id)}
                        className={`w-full cursor-pointer  flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${isAssigned ? 'bg-zinc-100/80 text-zinc-900' : 'text-zinc-700 hover:bg-primary-container'}`}
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-900">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                         </svg>
                        <span className="text-[14px] font-medium truncate flex-1 leading-tight">{p.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

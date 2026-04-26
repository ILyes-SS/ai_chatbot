"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useProjects } from "@/app/stores/projects-store";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    _id: string;
    title: string;
    context?: string;
  };
}

export default function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [context, setContext] = useState(project.context || "");
  const { optimisticUpdateProject } = useProjects();

  useEffect(() => setMounted(true), []);

  // Reset values when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      setTitle(project.title);
      setContext(project.context || "");
    }
  }, [isOpen, project.title, project.context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Optimistic: title/context update reflected instantly in project card and detail page
    optimisticUpdateProject(project._id, { title, context });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0" onClick={(e) => { e.stopPropagation(); onClose(); }} />

      <div className="relative w-full max-w-[480px] bg-surface-container-lowest border border-transparent rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-on-surface tracking-tight">Edit project</h2>
            <p className="text-[14px] text-on-surface-variant mt-1">Update your project&apos;s title and context.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-on-surface-variant mb-1.5">Project Name</label>
              <input
                id="edit-title"
                autoFocus
                required
                className="w-full h-11 px-4 bg-surface-container-low border border-transparent rounded-xl focus:outline-none focus:border-transparent focus:ring-1 focus:ring-primary-container text-[14px] text-on-surface placeholder:text-on-surface-variant/80 transition-colors disabled:opacity-50"
                placeholder="e.g. Marketing Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-context" className="block text-sm font-medium text-on-surface-variant mb-1.5">Description (Optional)</label>
              <textarea
                id="edit-context"
                className="w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-xl focus:outline-none focus:border-transparent focus:ring-1 focus:ring-primary-container text-[14px] text-on-surface placeholder:text-on-surface-variant/80 transition-colors disabled:opacity-50 resize-none h-[100px]"
                placeholder="Add some context or description about this project..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 cursor-pointer rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={ !title.trim()}
              className="px-4 py-2.5 cursor-pointer rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useState } from "react";
import { useProjects } from "@/app/stores/projects-store";
import { useRouter } from "next/navigation";

export default function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { optimisticAddProject } = useProjects();
  const router = useRouter();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setTitle("");
    setContext("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // Optimistic: new project card appears in list instantly
      const result = await optimisticAddProject({ title, context });
      if (result) {
        handleClose();
        router.push(`/projects/${result._id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
       
      <button 
        onClick={handleOpen}
        className="flex cursor-pointer items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition border border-zinc-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        New project
      </button>
      

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={handleClose} />

          <div className="relative w-full max-w-[480px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-[20px] font-semibold text-white tracking-tight">Create new project</h2>
                <p className="text-[14px] text-zinc-400 mt-1">Organize your chats into a dedicated workspace.</p>
              </div>
              <button 
                onClick={handleClose}
                className="p-1.5 -mr-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                disabled={isSubmitting}
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
                  <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name</label>
                  <input
                    id="title"
                    autoFocus
                    required
                    className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] text-white placeholder:text-zinc-600 transition-colors disabled:opacity-50"
                    placeholder="e.g. Marketing Campaign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-zinc-300 mb-1.5">Description (Optional)</label>
                  <textarea
                    id="context"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-[14px] text-white placeholder:text-zinc-600 transition-colors disabled:opacity-50 resize-none h-[100px]"
                    placeholder="Add some context or description about this project..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

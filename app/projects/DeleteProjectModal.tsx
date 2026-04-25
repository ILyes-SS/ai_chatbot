"use client";

import { useEffect } from "react";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isPending: boolean;
}

export default function DeleteProjectModal({ isOpen, onClose, onConfirm, title, isPending }: DeleteProjectModalProps) {
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

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={(e) => { e.stopPropagation(); onClose(); }} />

      <div className="relative w-full max-w-[400px] bg-surface-container-lowest border border-transparent rounded-2xl shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-on-surface tracking-tight">Delete Project</h2>
          <p className="text-[14px] text-on-surface-variant mt-2 leading-relaxed">
            Are you sure you want to delete <span className="text-on-surface font-medium">"{title}"</span>? All chats inside this project will be affected. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 cursor-pointer text-[14px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 cursor-pointer text-[14px] font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : "Delete"}
          </button>
        </div>

      </div>
    </div>
  );
}

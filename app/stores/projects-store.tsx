"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  createProject as serverCreateProject,
  updateProject as serverUpdateProject,
  deleteProject as serverDeleteProject,
} from "@/actions/projects";
import type { CreateProjectData, UpdateProjectData } from "@/lib/schemas/project";
import { useToast } from "./toast";




export interface ProjectItem {
  _id: string;
  title: string;
  context?: string;
  media?: string[];
  updatedAt: string | Date | null;
  createdAt?: string | Date | null;
  
  _optimistic?: boolean;
}

interface ProjectsContextValue {
  projects: ProjectItem[];
  optimisticAddProject: (data: CreateProjectData) => Promise<{ _id: string } | null>;
  optimisticUpdateProject: (id: string, data: UpdateProjectData) => void;
  optimisticDeleteProject: (id: string) => void;
}




function sortProjects(list: ProjectItem[]): ProjectItem[] {
  return [...list].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt as string).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt as string).getTime() : 0;
    return bTime - aTime;
  });
}




const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within <ProjectsProvider>");
  return ctx;
}




interface ProjectsProviderProps {
  initialProjects: ProjectItem[];
  children: React.ReactNode;
}

export function ProjectsProvider({ initialProjects, children }: ProjectsProviderProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(() => sortProjects(initialProjects));
  const { showToast } = useToast();

  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  
  const optimisticAddProject = useCallback(
    async (data: CreateProjectData): Promise<{ _id: string } | null> => {
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticProj: ProjectItem = {
        _id: tempId,
        title: data.title,
        context: data.context ?? "",
        media: data.media ?? [],
        updatedAt: now,
        createdAt: now,
        _optimistic: true,
      };

      // Optimistic: add immediately
      setProjects((prev) => sortProjects([optimisticProj, ...prev]));

      try {
        const result = await serverCreateProject(data);
        if (result.success && result.data) {
          const realId = result.data._id;
          // Replace temp with real
          setProjects((prev) =>
            sortProjects(
              prev.map((p) =>
                p._id === tempId
                  ? { ...optimisticProj, _id: realId, _optimistic: false }
                  : p,
              ),
            ),
          );
          return { _id: realId };
        } else {
          // Rollback
          setProjects((prev) => prev.filter((p) => p._id !== tempId));
          showToast(result.error || "Failed to create project", "error");
          return null;
        }
      } catch {
        setProjects((prev) => prev.filter((p) => p._id !== tempId));
        showToast("Failed to create project", "error");
        return null;
      }
    },
    [showToast],
  );

  // ── Update ──────────────────────────────────────────────────────────────
  const optimisticUpdateProject = useCallback(
    (id: string, data: UpdateProjectData) => {
      const snapshot = projectsRef.current;

      // Optimistic: apply updates immediately
      setProjects((prev) =>
        sortProjects(
          prev.map((p) => {
            if (p._id !== id) return p;
            const updated = { ...p, updatedAt: new Date().toISOString() };
            if (data.title !== undefined) updated.title = data.title;
            if (data.context !== undefined) updated.context = data.context;
            if (data.media !== undefined) updated.media = data.media;
            return updated;
          }),
        ),
      );

      // Fire server action
      serverUpdateProject(id, data).then((result) => {
        if (!result.success) {
          setProjects(sortProjects(snapshot));
          showToast(result.error || "Failed to update project", "error");
        }
      }).catch(() => {
        setProjects(sortProjects(snapshot));
        showToast("Failed to update project", "error");
      });
    },
    [showToast],
  );

  // ── Delete ──────────────────────────────────────────────────────────────
  const optimisticDeleteProject = useCallback(
    (id: string) => {
      const snapshot = projectsRef.current;

      // Optimistic: remove immediately
      setProjects((prev) => prev.filter((p) => p._id !== id));

      serverDeleteProject(id).then((result) => {
        if (!result.success) {
          setProjects(sortProjects(snapshot));
          showToast(result.error || "Failed to delete project", "error");
        }
      }).catch(() => {
        setProjects(sortProjects(snapshot));
        showToast("Failed to delete project", "error");
      });
    },
    [showToast],
  );

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        optimisticAddProject,
        optimisticUpdateProject,
        optimisticDeleteProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

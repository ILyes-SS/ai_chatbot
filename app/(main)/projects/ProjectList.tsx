"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useProjects } from "@/app/stores/projects-store";
import ProjectActionsMenu from "./ProjectActionsMenu";

interface ProjectListProps {
  /** Initial projects are now only used for hydration; the store is the source of truth */
  initialProjects?: any[];
}

export default function ProjectList({ initialProjects: _unused }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { projects } = useProjects();

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        (project.context && project.context.toLowerCase().includes(query))
    );
  }, [searchQuery, projects]);

  return (
    <>
      {/* Search Input */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <input 
          type="text" 
          className="block w-full pl-11 pr-4 py-3 border border-transparent rounded-xl leading-5 bg-surface-container-lowest text-on-surface placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-transparent focus:border-transparent sm:text-sm transition-colors shadow-sm" 
          placeholder="Search projects..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full lg:max-w-3xl">
        {filteredProjects.length === 0 ? (
          <div className="col-span-1 md:col-span-2 border border-transparent border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center bg-surface-container-lowest/50">
            <h3 className="text-sm font-medium text-on-surface mb-1">
              {searchQuery.trim() ? "No results found" : "No projects found"}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              {searchQuery.trim() 
                ? `No projects match your search for "${searchQuery}"`
                : "Get started by creating a new project."}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className={`relative group ${project._optimistic ? "opacity-70" : ""}`}>
              <Link href={`/projects/${project._id}`} className="block">
                <div className="border border-transparent rounded-xl p-6 hover:border-transparent transition-colors flex flex-col justify-between min-h-[160px] bg-surface-container-lowest shadow-sm cursor-pointer hover:bg-surface-container/50">
                  <div>
                    <h3 className="text-[17px] font-semibold text-on-surface truncate pr-8 mb-2">{project.title}</h3>
                    {project.context && (
                      <p className="text-[13px] text-on-surface-variant line-clamp-2">{project.context}</p>
                    )}
                  </div>
                  <p className="text-[12px] text-on-surface-variant mt-4">
                    Updated {new Date(project.updatedAt as string).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ProjectActionsMenu project={project} />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

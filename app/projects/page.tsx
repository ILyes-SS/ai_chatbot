import React from "react";
import { getProjects } from "@/actions/projects";
import Link from "next/link";
import CreateProjectButton from "./CreateProjectButton";
import ProjectActionsMenu from "./ProjectActionsMenu";

interface Project {
  _id: string;
  title: string;
  context?: string;
  updatedAt: string | Date;
}

export default async function ProjectsPage() {
  const result = await getProjects();
  const projects = (result.success && result.data ? result.data : []) as Project[];

  return (
    <div className="min-h-screen bg-zinc-950 p-8 md:p-12 lg:px-24 w-full">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <CreateProjectButton />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input 
            type="text" 
            className="block w-full pl-11 pr-4 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 sm:text-sm transition-colors shadow-sm" 
            placeholder="Search projects..." 
          />
        </div>

        {/* Project List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full lg:max-w-3xl">
          {projects.length === 0 ? (
            <div className="col-span-1 md:col-span-2 border border-zinc-800 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center bg-zinc-900/50">
              <h3 className="text-sm font-medium text-white mb-1">No projects found</h3>
              <p className="text-sm text-zinc-500 mb-4">Get started by creating a new project.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="relative group">
                {/* Clickable card area — Link only wraps the card content */}
                <Link href={`/projects/${project._id}`} className="block">
                  <div className="border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors flex flex-col justify-between min-h-[160px] bg-zinc-900 shadow-sm cursor-pointer hover:bg-zinc-800/50">
                    <div>
                      {/* Leave right-side padding for the absolutely-positioned menu button */}
                      <h3 className="text-[17px] font-semibold text-white truncate pr-8 mb-2">{project.title}</h3>
                      {project.context && (
                        <p className="text-[13px] text-zinc-400 line-clamp-2">{project.context}</p>
                      )}
                    </div>
                    <p className="text-[12px] text-zinc-500 mt-4">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>

                {/* Menu sits OUTSIDE the Link so its events never trigger navigation */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ProjectActionsMenu project={project} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

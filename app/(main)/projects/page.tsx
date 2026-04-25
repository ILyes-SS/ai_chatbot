import React from "react";
import { getProjects } from "@/actions/projects";
import CreateProjectButton from "./CreateProjectButton";
import ProjectList from "./ProjectList";

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
    <div className="min-h-screen bg-surface p-8 md:p-12 lg:px-24 w-full">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Projects</h1>
          <CreateProjectButton />
        </div>

        <ProjectList initialProjects={projects} />
      </div>
    </div>
  );
}

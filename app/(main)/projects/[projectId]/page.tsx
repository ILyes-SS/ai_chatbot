import { notFound } from "next/navigation";
import { getProjectById } from "@/actions/projects";
import { getConversationsByProjectId } from "@/actions/conversations";
import ProjectDetails from "./ProjectDetails";
import type { Project, Conversation } from "./ProjectDetails";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const projectResult = await getProjectById(projectId);
  
  if (!projectResult.success || !projectResult.data) {
    return notFound();
  }

  const project = projectResult.data as Project;

  const conversationsResult = await getConversationsByProjectId(projectId);
  const conversations = (conversationsResult.success ? conversationsResult.data : []) as Conversation[];

  return (
    <div className="min-h-screen bg-surface p-8 md:p-12 lg:px-24 w-full">
      <ProjectDetails 
        project={project} 
        conversations={conversations} 
      />
    </div>
  );
}

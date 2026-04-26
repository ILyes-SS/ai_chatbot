"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useProjects } from "@/app/stores/projects-store";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditProjectModal from "./EditProjectModal";
import DeleteProjectModal from "./DeleteProjectModal";

interface Project {
  _id: string;
  title: string;
  context?: string;
}

interface ProjectActionsMenuProps {
  project: Project;
}

export default function ProjectActionsMenu({ project }: ProjectActionsMenuProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { optimisticDeleteProject } = useProjects();
  const router = useRouter();

  const handleDelete = () => {
    // Optimistic: project card vanishes from grid instantly
    optimisticDeleteProject(project._id);
    setShowDeleteModal(false);
    // If we're on the project detail page, navigate away
    if (window.location.pathname.includes(`/projects/${project._id}`)) {
      router.push("/projects");
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100">
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-surface-container-lowest border-transparent text-on-surface-variant"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem 
            onClick={() => setShowEditModal(true)}
            className="focus:bg-primary-container hover:text-on-surface focus:text-on-surface cursor-pointer"
          >
            <Pencil className="mr-2 size-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:bg-red-200 hover:text-red-400 focus:bg-red-200 focus:text-red-400 cursor-pointer"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />
      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={project.title}
        isPending={false}
      />
    </div>
  );
}

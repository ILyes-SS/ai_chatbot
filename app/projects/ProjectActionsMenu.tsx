"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/projects";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(project._id);
      if (result.success) {
        setShowDeleteModal(false);
        router.refresh();
      } else {
        console.error(result.error);
      }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem 
            onClick={() => setShowEditModal(true)}
            className="hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <Pencil className="mr-2 size-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
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
        isPending={isPending}
      />
    </div>
  );
}

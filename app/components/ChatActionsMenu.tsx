"use client";

import { useState } from "react";
import {
  MoreVertical,
  Star,
  Pencil,
  FolderInput,
  Trash2,
} from "lucide-react";
import { useConversations } from "@/app/stores/conversations-store";
import { useProjects } from "@/app/stores/projects-store";
import MoveChatModal from "./MoveChatModal";
import DeleteChatModal from "./DeleteChatModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  _id: string;
  title: string;
  pinned: boolean;
  projectId?: string | null;
}

interface ChatActionsMenuProps {
  conversation: Conversation;
  /** Called when the user selects "Rename" from the dropdown */
  onRename?: () => void;
  /** Called after the conversation is deleted */
  onDelete?: () => void;
  /** Custom trigger element. Defaults to a MoreVertical icon button. */
  trigger?: React.ReactNode;
  /** Content alignment for the dropdown. Defaults to "end". */
  align?: "start" | "center" | "end";
  /** Called when the dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ChatActionsMenu({
  conversation,
  onRename,
  onDelete,
  trigger,
  align = "end",
  onOpenChange,
}: ChatActionsMenuProps) {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { optimisticUpdateConversation, optimisticDeleteConversation } = useConversations();
  const { projects } = useProjects();

  const handleTogglePin = () => {
    // Optimistic: conversation moves between Pinned/Recent instantly
    optimisticUpdateConversation(conversation._id, { pinned: !conversation.pinned });
  };

  const handleDelete = () => {
    // Optimistic: conversation vanishes from sidebar instantly
    optimisticDeleteConversation(conversation._id);
    setShowDeleteModal(false);
    onDelete?.();
  };

  return (
    <>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <MoreVertical className="size-4" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-48">
          <DropdownMenuItem onClick={handleTogglePin}>
            <Star className={`mr-2 size-4 ${conversation.pinned ? "fill-primary text-primary" : ""}`} />
            {conversation.pinned ? "Unstar" : "Star"}
          </DropdownMenuItem>
          {onRename && (
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 size-4" />
              Rename
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowMoveModal(true)}>
            <FolderInput className="mr-2 size-4" />
            {conversation.projectId ? "Change project" : "Add to project"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            className=" text-red-600 focus:text-red-500 focus:bg-red-200"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MoveChatModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        conversation={conversation}
        projects={projects}
      />
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={conversation.title}
        isPending={false}
      />
    </>
  );
}

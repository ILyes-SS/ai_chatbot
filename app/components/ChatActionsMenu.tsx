"use client";

import { useState, useTransition } from "react";
import {
  MoreVertical,
  Star,
  Pencil,
  FolderInput,
  Trash2,
} from "lucide-react";
import { updateConversation, deleteConversation } from "@/actions/conversations";
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

interface Project {
  _id: string;
  title: string;
}

interface ChatActionsMenuProps {
  conversation: Conversation;
  projects: Project[];
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
  projects,
  onRename,
  onDelete,
  trigger,
  align = "end",
  onOpenChange,
}: ChatActionsMenuProps) {
  const [isPinned, setIsPinned] = useState(conversation.pinned);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTogglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    startTransition(async () => {
      await updateConversation(conversation._id, { pinned: newPinned });
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteConversation(conversation._id);
      setShowDeleteModal(false);
      onDelete?.();
    });
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
          <DropdownMenuItem onClick={handleTogglePin} disabled={isPending}>
            <Star className={`mr-2 size-4 ${isPinned ? "fill-primary text-primary" : ""}`} />
            {isPinned ? "Unstar" : "Star"}
          </DropdownMenuItem>
          {onRename && (
            <DropdownMenuItem onClick={onRename} disabled={isPending}>
              <Pencil className="mr-2 size-4" />
              Rename
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowMoveModal(true)} disabled={isPending}>
            <FolderInput className="mr-2 size-4" />
            {conversation.projectId ? "Change project" : "Add to project"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            disabled={isPending}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
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
        isPending={isPending}
      />
    </>
  );
}

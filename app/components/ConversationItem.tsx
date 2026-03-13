import Link from "next/link";

interface Conversation {
  _id: string;
  title: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  expanded: boolean;
}

export default function ConversationItem({ conversation, expanded }: ConversationItemProps) {
  return (
    <li>
      <Link
        href={`/chat/${conversation._id}`}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 no-underline text-[13px] transition-colors hover:bg-zinc-800/50 whitespace-nowrap overflow-hidden"
        title={conversation.title}
      >
        {expanded && (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {conversation.title}
          </span>
        )}
      </Link>
    </li>
  );
}

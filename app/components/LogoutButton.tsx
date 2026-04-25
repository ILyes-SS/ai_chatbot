'use client';
import {LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";



const LogoutButton = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
      const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
        router.refresh();
      };
  return (
    <Button variant="ghost" onClick={handleSignOut} size="icon" className="text-muted-foreground hover:text-foreground hover:bg-surface-container">
      <LogOutIcon />
    </Button>
  );
};

export default LogoutButton;
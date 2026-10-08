"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import {
  ACCOUNT_MENU_ICON_CLASS,
  ACCOUNT_MENU_ITEM_CLASS,
} from "@/components/header/headerActionStyles";

interface LogoutButtonProps {
  onClose?: () => void;
}

const LogoutButton = ({ onClose }: LogoutButtonProps) => {
  const { logout } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    onClose?.();
    logout();
    router.push("/login");
  };

  return (
    <button
      type="button"
      className={ACCOUNT_MENU_ITEM_CLASS}
      onClick={() => void handleLogout()}
    >
      <span className={ACCOUNT_MENU_ICON_CLASS}>
        <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      Log out
    </button>
  );
};

export default LogoutButton;

"use client";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";

const LogoutButton = () => {
  let { logout } = useSession();
  const router = useRouter();
  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  return (
    <div
      className="flex cursor-pointer items-center p-2 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
      onClick={handleLogout}
    >
      <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 12H3.62"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.85 8.6499L2.5 11.9999L5.85 15.3499"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium ">{"Log out"}</p>
      </div>
    </div>
  );
};

export default LogoutButton;

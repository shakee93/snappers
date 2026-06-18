"use client";

import { useSession } from "@/context/SessionProvider";
import { useEffect, useState } from "react";
import AvatarSkeleton from "@/components/global/primitives/Skeletons/AvatarSkeleton";
import { accountLayoutTitleClassName } from "@/components/account/accountStyles";

const UserDetails = () => {
  const { customer, fetchCustomer } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCustomer();
      setIsLoading(false);
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayName(customer?.displayName || "");
    setEmail(customer?.email || "");
  }, [customer]);

  return (
    <div className="max-w-2xl">
      <h1 className={accountLayoutTitleClassName}>Account</h1>
      {isLoading ? (
        <AvatarSkeleton />
      ) : (
        <span className="mt-4 block text-base text-neutral-500 dark:text-neutral-400 sm:text-lg">
          <span className="font-semibold text-header-green dark:text-neutral-200">
            {displayName} ·
          </span>{" "}
          {email}
        </span>
      )}
    </div>
  );
};

export default UserDetails;

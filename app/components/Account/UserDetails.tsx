"use client";
import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const UserDetails = () => {
  const { customer, fetchCustomer, updateCustomer } = useSession();
  const router = useRouter();
  useEffect(() => {
    fetchCustomer();
    if (!customer) {
      // Redirect to the login page if customer is not found
      router.push('/login');
    }
  }, [customer]);

  const displayName = customer?.displayName || "";
  const email = customer?.email || "";
  const address = customer?.shipping?.address1 || "";

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl xl:text-4xl font-semibold">Account</h2>
      <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">
        <span className="text-slate-900 dark:text-slate-200 font-semibold">
          {displayName}
        </span>{" "}
        {email} · {address}
      </span>
    </div>
  );
};

export default UserDetails;

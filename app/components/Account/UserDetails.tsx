"use client";
import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const UserDetails = () => {
  const { customer, fetchCustomer, updateCustomer } = useSession();
  const router = useRouter();

  // Define state variables for displayName, email, and address
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Fetch customer data
    fetchCustomer();
  }, []);

  useEffect(() => {
    // Update state variables with customer data
    setDisplayName(customer?.displayName || "");
    setEmail(customer?.email || "");
    setAddress(customer?.shipping?.address1 || "");
  }, [customer]);
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

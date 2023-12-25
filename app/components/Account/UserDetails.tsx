"use client";
import React, { useEffect, useState } from "react";

const UserDetails = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Check if the code is running on the client side (in a browser)
    if (typeof window !== "undefined") {
      const storedDisplayName = localStorage.getItem("displayName");
      const storedEmail = localStorage.getItem("email");
      const storedAddress = localStorage.getItem("address");

      if (storedDisplayName) {
        setDisplayName(storedDisplayName);
      }
      if (storedEmail) {
        setEmail(storedEmail);
      }
      if (storedAddress) {
        setAddress(storedAddress);
      }
    }
  }, []); // Empty dependency array ensures that this effect runs only once

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

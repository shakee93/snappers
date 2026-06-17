import { Suspense } from "react";
import AccountPageClient from "@/components/account/AccountPageClient";

const AccountPage = () => {
  return (
    <Suspense fallback={<div className="container my-20 text-center">Loading...</div>}>
      <AccountPageClient />
    </Suspense>
  );
};

export default AccountPage;

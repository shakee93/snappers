import { Suspense } from "react";
import LoginPanel from "@/components/auth/LoginPanel";
import { authPageTitleClassName } from "@/components/auth/authStyles";

const PageLogin = () => {
  return (
    <div className="nc-PageLogin" data-nc-id="PageLogin">
      <div className="container mb-24 lg:mb-32">
        <h1 className={authPageTitleClassName}>Login</h1>
        {/* Cap at GSI's 400px max button width so Google and "Send code" align. */}
        <div className="mx-auto max-w-[400px] space-y-6">
          <Suspense fallback={<div className="py-8 text-center text-sm text-neutral-500">Loading...</div>}>
            <LoginPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

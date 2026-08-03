import { Suspense } from "react";
import LoginPanel from "@/components/auth/LoginPanel";
import {
  authPageTitleClassName,
  authPageWrapperClassName,
} from "@/components/auth/authStyles";

const PageLogin = () => {
  return (
    <div className="nc-PageLogin" data-nc-id="PageLogin">
      <div className="container mb-24 lg:mb-32">
        <h1 className={authPageTitleClassName}>Login</h1>
        <div className={authPageWrapperClassName}>
          <Suspense fallback={<div className="py-8 text-center text-sm text-neutral-500">Loading...</div>}>
            <LoginPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

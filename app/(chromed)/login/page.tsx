import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import {
  authLinkClassName,
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
            <LoginForm />
          </Suspense>
          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            New user?{" "}
            <Link className={authLinkClassName} href="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

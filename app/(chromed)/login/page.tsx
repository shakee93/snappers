import Link from "next/link";
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
          <LoginForm />
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

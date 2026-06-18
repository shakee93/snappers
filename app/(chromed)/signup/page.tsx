import Link from "next/link";
import SignUpForm from "@/components/auth/SignUpForm";
import {
  authLinkClassName,
  authPageTitleClassName,
  authPageWrapperClassName,
} from "@/components/auth/authStyles";

const PageSignUp = () => {
  return (
    <div className="nc-PageSignUp" data-nc-id="PageSignUp">
      <div className="container mb-24 lg:mb-32">
        <h1 className={authPageTitleClassName}>Signup</h1>
        <div className={authPageWrapperClassName}>
          <SignUpForm />
          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            Already have an account?{" "}
            <Link className={authLinkClassName} href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;

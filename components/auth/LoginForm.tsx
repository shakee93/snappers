"use client";

import { useState } from "react";
import Button from "@/shared/Button/Button";
import AuthInput from "@/components/auth/AuthInput";
import { LoginResponse } from "@/utils/type";
import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { getRandomWelcomeMessage } from "@/components/global/forms/HelperComps";
import Link from "next/link";
import {
  authLabelClassName,
  authLinkClassName,
  authSubmitButtonClassName,
} from "@/components/auth/authStyles";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { fetchCustomer, login } = useSession();
  const router = useRouter();

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      let response: LoginResponse = await login(email, password);

      if (response.error) {
        toast.error(response.error);
        setIsLoading(false);
        return;
      }

      const randomMessage = getRandomWelcomeMessage();
      toast(randomMessage);

      await fetchCustomer();
      router.push("/");
      localStorage.removeItem("last_order");
    } catch (error: unknown) {
      console.error("Error:", error);
      const message = error instanceof Error ? error.message : "";

      if (message.includes("fetch") || message.includes("network")) {
        toast.error(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else if (message.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else if (message.includes("500") || message.includes("Internal Server Error")) {
        toast.error("Server error occurred. Please try again in a few moments.");
      } else {
        toast.error("Something went wrong, please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleFormSubmit}>
      <label className="block">
        <span className={authLabelClassName}>Email address</span>
        <AuthInput
          type="email"
          placeholder="example@example.com"
          required={true}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block">
        <span className={`flex items-center justify-between ${authLabelClassName}`}>
          Password
          <Link href="/forgot-pass" className={`text-sm ${authLinkClassName}`}>
            Forgot password?
          </Link>
        </span>
        <AuthInput
          type="password"
          required={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <Button
        type="submit"
        disabled={isLoading}
        className={authSubmitButtonClassName}
        fontSize="text-base font-bold"
      >
        {isLoading ? (
          <Loader className="h-5 w-5 animate-spin text-header-green" />
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;

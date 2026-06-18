"use client";

import { useState } from "react";
import Button from "@/shared/Button/Button";
import AuthInput from "@/components/auth/AuthInput";
import { useSession } from "@/context/SessionProvider";
import { SignUpResponse } from "@/utils/type";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import {
  authLabelClassName,
  authSubmitButtonClassName,
} from "@/components/auth/authStyles";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useSession();
  const router = useRouter();

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      const response: SignUpResponse = await signUp(email, password);

      if (response.error !== null) {
        toast(`Signup Issue: ${response.error}`);
        setIsLoading(false);
        return;
      }
      if (response.data === "registered") {
        setIsLoading(false);
        toast("Registered Successfully");
        router.push("/");
        return;
      }
      router.push("/");
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
    }
  };

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleFormSubmit}>
      <label className="block">
        <span className={authLabelClassName}>Email address</span>
        <AuthInput
          required={true}
          type="email"
          placeholder="example@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block">
        <span className={authLabelClassName}>Password</span>
        <AuthInput
          required={true}
          type="password"
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

export default SignUpForm;

"use client";

import {useState} from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {useSession} from "@/context/SessionProvider";
import {SignUpResponse} from "@/utils/type";
import {useRouter} from "next/navigation";
import { toast } from "sonner";
import {Loader} from "lucide-react";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { signUp } = useSession();
  const router = useRouter();

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true); // Set loading state to true
      const response: SignUpResponse = await signUp(email, password);

      if (response.error !== null) {
        toast(`Signup Issue: ${response.error}`);
        setIsLoading(false); // Set
        return;
      }
      if (response.data === "registered") {
        setIsLoading(false); // Set
        toast("Registered Successfully");
        router.push("/");
        return;
      }
      router.push("/");
    } catch (error) {
      setIsLoading(false); // Set
      console.error("Error:", error);
    }
  };

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleFormSubmit}>
      <label className="block">
        <span className="text-neutral-800 dark:text-neutral-200">
          Email address
        </span>
        <Input
          required={true}
          type="email"
          placeholder="example@example.com"
          className="mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
          Password
          {/* <Link href="/forgot-pass" className="text-sm text-green-600">
                        Forgot password?
                    </Link> */}
        </span>
        <Input
          required={true}
          type="password"
          className="mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <ButtonPrimary type="submit">
        {isLoading ? (
          <Loader className="animate-spin text-gray-100 " />
        ) : (
          "Continue"
        )}
      </ButtonPrimary>
    </form>
  );
};

export default SignUpForm;

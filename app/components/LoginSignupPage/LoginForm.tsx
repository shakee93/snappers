"use client";

import { useState } from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { LoginResponse } from "@/utils/type";
import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { getRandomWelcomeMessage } from "@/components/AddressPageComps/HelperComps";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const { fetchCustomer, login } = useSession();
  const router = useRouter();

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      let response: LoginResponse = await login(email, password);
      if (response.error) {
        let errorMessage = `${response.error}`;
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      const randomMessage = getRandomWelcomeMessage();
      toast(randomMessage);
    } catch (error) {
      console.error("Error:", error);
    } finally {
        router.push("/");
      setIsLoading(false);
      fetchCustomer();
    }
  };

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleFormSubmit}>
      <label className="block">
        <span className="text-neutral-800 dark:text-neutral-200">
          Email address
        </span>
        <Input
          type="email"
          placeholder="example@example.com"
          required={true}
          className="mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
          Password
        </span>
        <Input
          type="password"
          className="mt-1"
          required={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <ButtonPrimary type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader className="animate-spin text-gray-100 " />
        ) : (
          "Continue"
        )}
      </ButtonPrimary>
    </form>
  );
};

export default LoginForm;

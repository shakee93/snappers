"use client";

import { useState } from "react";
import gql from "graphql-tag";
import Input from "@/shared/Input/Input";
import Link from "next/link";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { LoginResponse } from "@/utils/type";
import { useSession } from "@/context/SessionProvider";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';

const LoginForm = () => {
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 

    const { login } = useSession();
    const router = useRouter();

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            let response: LoginResponse = await login(email, password);
            if (response.error) {
                let errorMessage = `Login Issue: ${response.error}`
                toast(errorMessage);
                return
            }
            toast("Logged in  Successfully")
            router.push("/account");
        } catch (error) {
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
                    type="email"
                    placeholder="example@example.com"
                    className="mt-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Update email state on change
                />
            </label>
            <label className="block">
                <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                    Password
                    <Link href="/forgot-pass" className="text-sm text-green-600">
                        Forgot password?
                    </Link>
                </span>
                <Input
                    type="password"
                    className="mt-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Update password state on change
                />
            </label>
            <ButtonPrimary type="submit">Continue</ButtonPrimary>
        </form>
    );
};

export default LoginForm;

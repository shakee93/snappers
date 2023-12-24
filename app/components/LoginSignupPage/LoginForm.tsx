"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import Input from "@/shared/Input/Input";
import Link from "next/link";
import ButtonPrimary from "@/public/shared/Button/ButtonPrimary";
import { LoginResponse } from "@/utils/type";
import { useSession } from "@/context/SessionProvider";

const REGISTER_CUSTOMER_MUTATION = gql`
    mutation RegisterCustomer($input: RegisterCustomerInput!) {
        registerCustomer(input: $input) {
            authToken
            refreshToken
        }
    }
`;

const LoginForm = () => {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [email, setEmail] = useState(""); // State for email input
    const [password, setPassword] = useState(""); // State for password input

    const {login} = useSession();
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            let response : LoginResponse = await login(email, password);
            if(response.error !== null ){
                alert(`Login Issue: ${response.error}`)
                return
            }
            if( response.data == "logged_in"){
                alert("Registered Successfully")
            }
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

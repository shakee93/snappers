"use client";

import {useState} from "react";
import Input from "@/shared/Input/Input";
import Link from "next/link";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {useSession} from "@/context/SessionProvider";
import {SignUpResponse} from "@/utils/type";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";


const SignUpForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signUp } = useSession();
    const router = useRouter();

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response: SignUpResponse = await signUp(email, password);

            if (response.error !== null) {
                toast(`Signup Issue: ${response.error}`);
                return;
            }
            if (response.data === 'registered') {
                toast("Registered Successfully")
                router.push('/');
                return
            }
            router.push('/');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form className="grid grid-cols-1 gap-6" onSubmit={handleFormSubmit}>
            <label className="block">
                <span className="text-neutral-800 dark:text-neutral-200">Email address</span>
                <Input
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
          <Link href="/forgot-pass" className="text-sm text-green-600">
            Forgot password?
          </Link>
        </span>
                <Input
                    type="password"
                    className="mt-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            <ButtonPrimary type="submit">Continue</ButtonPrimary>
        </form>
    );
};

export default SignUpForm;
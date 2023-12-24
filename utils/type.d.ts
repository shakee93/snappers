export type Session = {
    sessionToken: string | null,
    signUp: (email: string, password: string) => Promise<SignUpResponse>
}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}



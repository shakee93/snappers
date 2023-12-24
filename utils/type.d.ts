export type Session = {
    sessionToken: string | null,
    signUp: (email: string, password: string) => Promise<SignUpResponse>,
    login: (email: string, password: string) => Promise<LoginResponse>,
}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}

export type LoginResponse = {
    data: string | null;
    error: string | null;
}



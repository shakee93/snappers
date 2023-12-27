export type Session = {
    sessionToken: string | null,
    signUp:  any,
    // login: (email: string, password: string) => Promise<LoginResponse>,
    login:any, 
    logout:  any,

}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}

export type LoginResponse = {
    data: string | null;
    error: string | null;
}



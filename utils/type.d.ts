export type Session = {
    sessionToken: string | null,
    signUp: (email: string, password: string) => Promise<SignUpResponse>,
    // login: (email: string, password: string) => Promise<LoginResponse>,
    login:any, 
    logout: ()=> void,
    updateCustomer:any

}

export type SignUpResponse = {
    data: string | null;
    error: string | null;
}

export type LoginResponse = {
    data: string | null;
    error: string | null;
}



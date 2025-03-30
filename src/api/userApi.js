import { dontLoginFetch, apiFetch } from "./fetchConfig";

export interface UserOutPut {
    id: number;
    userId: string;
    userNm: string;
    email: string;
    roleId: string;
    status: string;
    message: string;
}

export const signIn = async (req: any): Promise<UserOutPut> => {
    try {
        const data = await dontLoginFetch.post('/login', req)
        return data.json();
    } catch (error) {
        throw error;
    }
}
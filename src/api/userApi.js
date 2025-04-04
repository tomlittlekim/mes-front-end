import { dontLoginFetch, apiFetch, graphFetch } from "./fetchConfig";

export interface UserOutPut {
    userId: number;
    loginId: string;
    userNm: string;
    email: string;
    roleId: number;
    roleNm: string;
    status: string;
    message: string;
}

export const signIn = async (req: any): Promise<UserOutPut> => {
    try {
        const data = await dontLoginFetch.post('/api/login', req)
        return data.json();
    } catch (error) {
        throw error;
    }
}

const userGroupQuery =`
  query {
    getUserGroup {
      id
      loginId
      userName
      departmentName
      position
      authorityName
      email
      phoneNumber
      flagActive
    }
  }
`
export const getUserGroup = (req) => graphFetch(userGroupQuery, req)

const rolesQuery = `
    query {
      getRoles {
        roleId
        roleName
      }
    }
  `;
export const getRoleGroup = () => graphFetch(rolesQuery)

import { dontLoginFetch, apiFetch, graphFetch } from "./fetchConfig";

export interface UserOutPut {
    userId: number;
    loginId: string;
    userNm: string;
    email: string;
    roleId: number;
    roleNm: string;
    priorityLevel: number;
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
  query getUserGroup($req: UserGroupRequest!) {
    getUserGroup(req: $req) {
      id
      loginId
      userName
      departmentId
      positionId
      roleId
      userEmail
      phoneNum
      flagActive
    }
  }
`
export const getUserGroup = (req) => graphFetch(userGroupQuery, {req: req})

const rolesQuery = `
    query {
      getRoles {
        roleId
        roleName
      }
    }
  `;
export const getRoleGroup = () => graphFetch(rolesQuery)

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

export const getUserGroup = async (req) => {
    const userGroupQuery =`
      query getUserGroup($req: UserGroupRequest) {
        getUserGroup(req: $req) {
          site
          compCd
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
      }`;

    const data = await graphFetch(userGroupQuery, {req: req})
    return data.getUserGroup
}

const rolesQuery = `
    query {
      getRoles {
        roleId
        roleName
        priorityLevel
      }
    }
  `;
export const getRoleGroup = () => graphFetch(rolesQuery)

const upsertQuery = `
    mutation upsertUser($req: UserInput!) {
        upsertUser(req: $req)
    }
`
export const upsertUser = (req) => {
    const values = {
        ...req,
        id: req.id === null ? -1 : req.id,
        flagActive: req.flagActive === 'Y' ? true : false
    };
    return graphFetch(upsertQuery, {req: values})
}

const existUserIdQuery = `
    query existLoginId($req: ExistLoginRequest!) {
        existLoginId(req: $req)
    }
`
export const isExistsUserId = (loginId) => {
    const variables = {
        req: {
            loginId: loginId
        }
    };
    return graphFetch(existUserIdQuery, variables);
}

const deleteUserQuery = `
    mutation deleteUser($id: Int!) {
        deleteUser(id: $id)
    }
`
export const deleteUser = (id) => graphFetch(deleteUserQuery, {id:id})

const resetPwdQuery = `
    mutation resetPwd($id: Int!) {
        resetPwd(id: $id)
    }
`
export const resetPwd = (id) => graphFetch(resetPwdQuery, {id:id})

export const getUserSummery = async (loginId) => {
    const userSummeryQuery = `
    query getUserSummery($loginId: String!) {
        getUserSummery(loginId: $loginId) {
            id
            loginId
            userName
            departmentId
            positionId
            roleId
            imagePath
            userEmail
            phoneNum
            flagActive
        }
    }`
    const result = await graphFetch(userSummeryQuery, {loginId: loginId})
    return result.getUserSummery
}

import { graphFetch } from "./fetchConfig";

// 권한 목록 조회 쿼리
const rolesQuery = `
    query {
        getRoles {
            roleId
            site
            compCd
            priorityLevel
            roleName
            flagDefault
            sequence
        }
    }
`;

// 권한 선택용 목록 조회 쿼리
const rolesForSelectQuery = `
    query {
        getRolesForSelect {
            roleId
            roleName
            priorityLevel
        }
    }
`;

// 권한 생성/수정 뮤테이션
const upsertRoleQuery = `
    mutation upsertUserRole($req: UserRoleRequest!) {
        upsertUserRole(req: $req)
    }
`;

// 권한 삭제 뮤테이션
const deleteRoleQuery = `
    mutation deleteUserRole($roleId: Int!) {
        deleteUserRole(roleId: $roleId)
    }
`;

// 권한 목록 조회
export const getRoles = () => graphFetch(rolesQuery);

// 권한 선택용 목록 조회
export const getRolesForSelect = () => graphFetch(rolesForSelectQuery);

// 권한 생성/수정
export const upsertUserRole = (req) => graphFetch(upsertRoleQuery, { req });

// 권한 삭제
export const deleteUserRole = (roleId) => graphFetch(deleteRoleQuery, { roleId }); 
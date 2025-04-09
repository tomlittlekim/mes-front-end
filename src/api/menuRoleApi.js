import { graphFetch } from "./fetchConfig";

// 메뉴 권한 그룹 조회 쿼리
const menuRoleGroupQuery = `
    query {
        getMenuRoleGroup {
            id
            roleId
            menuId
            isOpen
            isDelete
            isInsert
            isAdd
            isPopup
            isPrint
            isSelect
            isUpdate
        }
    }
`;

// 초기 메뉴 권한 조회 쿼리
const initialMenuRoleQuery = `
    query getInitialMenuRole($roleId: Int) {
        getInitialMenuRole(roleId: $roleId) {
            id
            roleId
            menuId
            isOpen
            isDelete
            isInsert
            isAdd
            isPopup
            isPrint
            isSelect
            isUpdate
        }
    }
`;

// 특정 메뉴의 권한 조회 쿼리
const menuRoleQuery = `
    query getMenuRole($menuId: String!) {
        getMenuRole(menuId: $menuId) {
            id
            roleId
            menuId
            isOpen
            isDelete
            isInsert
            isAdd
            isPopup
            isPrint
            isSelect
            isUpdate
        }
    }
`;

// 메뉴 권한 생성/수정 뮤테이션
const upsertMenuRoleQuery = `
    mutation upsertMenuRole($list: [MenuRoleRequest]) {
        upsertMenuRole(list: $list)
    }
`;

// 메뉴 권한 그룹 조회
export const getMenuRoleGroup = () => graphFetch(menuRoleGroupQuery);

// 초기 메뉴 권한 조회
export const getInitialMenuRole = (roleId) => graphFetch(initialMenuRoleQuery, { roleId });

// 특정 메뉴의 권한 조회
export const getMenuRole = (menuId) => graphFetch(menuRoleQuery, { menuId });

// 메뉴 권한 생성/수정
export const upsertMenuRole = (list) => graphFetch(upsertMenuRoleQuery, { list }); 
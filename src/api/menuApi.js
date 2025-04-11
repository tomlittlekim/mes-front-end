import { graphFetch } from "./fetchConfig";

// 메뉴 목록 조회 쿼리
const menusQuery = `
    query {
        getMenus {
            id
            menuId
            menuName
            upMenuId
            flagSubscribe
            sequence
            flagActive
        }
    }
`;

// 메뉴 생성/수정 뮤테이션
const upsertMenusQuery = `
    mutation upsertMenus($req: MenuRequest!) {
        upsertMenus(req: $req)
    }
`;

// 메뉴 삭제 뮤테이션
const deleteMenuQuery = `
    mutation deleteMenu($id: Int) {
        deleteMenu(id: $id)
    }
`;

// 메뉴 목록 조회
export const getMenus = () => graphFetch(menusQuery);

// 메뉴 생성/수정
export const upsertMenus = (req) => graphFetch(upsertMenusQuery, { req });

// 메뉴 삭제
export const deleteMenu = (id) => graphFetch(deleteMenuQuery, { id }); 
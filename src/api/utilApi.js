import { graphFetch } from "./fetchConfig";

const codeQuery = `
    query getGridCodes($codeClassId: String!) {
      getGridCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;
// 접속한 유저의 site, compCd 가 동일한 code를 가져오기 위함
export const getCodes = async (data) => graphFetch(codeQuery, {codeClassId: data});

const initialCodeQuery = `
    query getInitialCodes($codeClassId: String!) {
      getInitialCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;
// site, compCd === 'default' 인 즉 공통으로 사용되는 code를 가져오기 위함
export const getInitialCodes = async (data) => graphFetch(initialCodeQuery, {codeClassId: data});

// 개발자 권한만 이용할 수 있는 회사 select 조회
export const getCompanySelect = async () => {
  const CompanyQuery = `
    query getCompaniesForSelect {
      getCompaniesForSelect {
        compCd
        companyName
      }
    }`;

  const result = await graphFetch(CompanyQuery)
  const dataList = result.getCompaniesForSelect ?? [];
  return [
      ...dataList,
    { compCd: 'default', companyName: '공용' },
  ]
};

const siteQuery = `
    query getInitialCodes($codeClassId: String!) {
      getInitialCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;
// site, compCd === 'default' 인 즉 공통으로 사용되는 code를 가져오기 위함
export const getSite = async () => {
  const result = await graphFetch(siteQuery, {codeClassId: 'ADDRESS'})
  const dataList = result.getInitialCodes ?? [];
  return [
    ...dataList,
    { codeId: 'default', codeName: '공용' },
  ]
};


const menusQuery = `
    query {
        getMenus {
            menuId
            menuName
        }
    }
`;
// 메뉴 셀렉트 조회
export const getMenuSelect = () => graphFetch(menusQuery);
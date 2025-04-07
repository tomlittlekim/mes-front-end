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

const CompanyQuery = `
    query getCompanySelect {
      getCompanySelect {
        compCd
        companyName
      }
    }
  `;
// 개발자 권한만 이용할 수 있는 회사 select 조회
export const getCompanySelect = async () => graphFetch(CompanyQuery);
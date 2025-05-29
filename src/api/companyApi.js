import { graphFetch } from './fetchConfig';

// 회사 상세 정보 조회 쿼리
const companyDetailsQuery = `
  query {
    getCompanyDetails {
      id
      site
      compCd
      businessRegistrationNumber
      corporateRegistrationNumber
      companyName
      imagePath
      businessAddress
      businessType
      businessItem
      paymentDate
      expiredDate
      flagSubscription
      loginId
      phoneNumber
      flagActive
    }
  }
`;

// 회사 생성/수정 뮤테이션
const upsertCompanyMutation = `
  mutation upsertCompany($req: CompanyInput!) {
    upsertCompany(req: $req)
  }
`;

// 회사 삭제 뮤테이션
const deleteCompanyMutation = `
  mutation deleteCompany($compCd: String!) {
    deleteCompany(compCd: $compCd)
  }
`;

// 회사 선택 옵션 조회 쿼리
const companiesForSelectQuery = `
  query {
    getCompaniesForSelect {
      id
      site
      compCd
      companyName
    }
  }
`;

// API 함수들
export const getCompanies = async (searchCondition = {}) => {
  const companiesQuery = `
  query getCompanies($req: CompanySearchCondition) {
    getCompanies(req: $req) {
      id
      site
      compCd
      businessRegistrationNumber
      corporateRegistrationNumber
      companyName
      imagePath
      businessAddress
      businessType
      businessItem
      paymentDate
      expiredDate
      flagSubscription
      loginId
      phoneNumber
      flagActive
    }
  }`;

  const result = await graphFetch(companiesQuery, { req:searchCondition });
  return result.getCompanies;
};

export const getCompanyDetails = () => graphFetch(companyDetailsQuery);

export const upsertCompany = (req) => graphFetch(upsertCompanyMutation, { req });

export const deleteCompany = (id) => graphFetch(deleteCompanyMutation, { id });

export const getCompaniesForSelect = () => graphFetch(companiesForSelectQuery); 
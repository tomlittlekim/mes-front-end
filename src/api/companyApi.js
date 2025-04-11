import { graphFetch } from "./fetchConfig";

// 회사 선택 목록 조회 쿼리
const companySelectQuery = `
    query {
        getCompanies {
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
const upsertCompanyQuery = `
    mutation upsertCompany($req: CompanyInput) {
        upsertCompany(req: $req)
    }
`;

// 회사 삭제 뮤테이션
const deleteCompanyQuery = `
    mutation deleteCompany($id: Int) {
        deleteCompany(id: $id)
    }
`;

// 회사 선택 목록 조회
export const getCompanySelect = () => graphFetch(companySelectQuery);

// 회사 생성/수정
export const upsertCompany = (req) => graphFetch(upsertCompanyQuery, { req });

// 회사 삭제
export const deleteCompany = (id) => graphFetch(deleteCompanyQuery, { id }); 
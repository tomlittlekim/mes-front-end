import { gql } from '@apollo/client';

/**
 * 불량정보 목록 조회 쿼리
 */
export const ALL_DEFECT_INFOS_QUERY = gql`
    query getAllDefectInfos {
        allDefectInfos {
            id
            site
            compCd
            prodResultId
            defectId
            productId
            productName
            defectQty
            resultInfo
            state
            defectCause
            equipmentId
            createDate
            createUser
            updateDate
            updateUser
            flagActive
        }
    }
`;

/**
 * 특정 생산실적ID에 대한 불량정보 조회 쿼리
 */
export const DEFECT_INFO_BY_PROD_RESULT_QUERY = gql`
    query getDefectInfosByProdResultId($prodResultId: String!) {
        defectInfosByProdResultId(prodResultId: $prodResultId) {
            id
            site
            compCd
            prodResultId
            defectId
            productId
            productName
            defectQty
            resultInfo
            state
            defectCause
            equipmentId
            createDate
            createUser
            updateDate
            updateUser
            flagActive
        }
    }
`; 
import {gql} from "@apollo/client";
import {
    BOM_DELETE_MUTATION, BOM_DETAIL_DELETE_MUTATION, BOM_DETAIL_MUTATION,
    BOM_DETAIL_QUERY,
    BOM_MUTATION,
    BOM_QUERY, MATERIALS_BY_TYPE_QUERY
} from "../../../graphql-queries/material-master/bomQueries";

/** GraphQL 쿼리 정의 */
//BOM 좌측 그리드
export const BOM_GET = gql`${BOM_QUERY}`;
export const BOM_SAVE = gql`${BOM_MUTATION}`;
export const BOM_DELETE = gql`${BOM_DELETE_MUTATION}`;
//BOM 세부 그리드
export const BOM_DETAIL_GET = gql`${BOM_DETAIL_QUERY}`;
export const BOM_DETAIL_SAVE = gql`${BOM_DETAIL_MUTATION}`;
export const BOM_DETAIL_DELETE = gql`${BOM_DETAIL_DELETE_MUTATION}`;
//드랍다운 목록들
export const GET_MATERIALS_BY_TYPE = gql`${MATERIALS_BY_TYPE_QUERY}`;

/** 검색 조건 값 초기화 */
export const SEARCH_CONDITIONS = {
    materialType: '',
    materialName: '',
    bomName: '',
    // flagActive: null
};

/** 그리드 컬럼을 정의 */
//BOM DETAIL(행추가)
export const BOM_DETAIL_NEW_ROW_STRUCTURE = {
    seq: null,
    bomLevel: '',
    bomId: '',
    bomDetailId: '',
    materialType: '',
    systemMaterialId: '',
    materialName: '',
    userMaterialId: '',
    parentItemCd: '',
    parentMaterialName: '',
    userParentItemCd: '',
    materialStandard: '',
    unit: '',
    itemQty: 0,
    remark: '',
    // flagActive: 'Y',
};

/** 서버에 보내야 하는 BOM 필드 구조 */
export const BOM_SERVER_FIELDS = {
    bomId: '',
    bomLevel: 1,
    materialType: '',
    bomName: '',
    systemMaterialId: '',
    remark: ''
};
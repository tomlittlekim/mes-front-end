/**
 * 계획대비 실적조회 GraphQL 쿼리
 */

// 생산계획 및 실적 데이터 조회 쿼리
export const GET_PLAN_VS_ACTUAL_DATA = `
  query getPlanVsActualData($filter: PlanVsActualFilter) {
    getPlanVsActualData(filter: $filter) {
      productId
      productName
      planDate
      planQty
      orderQty
      completedQty
      remainingQty
      achievementRate
      state
    }
  }
`;

// 제품 목록 조회 쿼리
export const GET_PRODUCTS_LIST = `
  query getProducts($filter: ProductFilter) {
    getProducts(filter: $filter) {
      id
      productId
      productName
      productType
      productCategory
    }
  }
`; 
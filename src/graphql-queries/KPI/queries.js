/**
 * KPI 관련 GraphQL 쿼리
 */

/**
 * 구독 중인 KPI 지표 데이터 조회 쿼리
 * 각 KPI 지표에 대한 차트 데이터를 반환
 * @deprecated 이제 getKpiChartData 쿼리를 사용하세요
 */
export const GET_SUBSCRIBED_KPI_DATA = `
  query getSubscribedKpiData($filter: KpiFilter!) {
    getSubscribedKpiData(filter: $filter) {
      kpiIndicatorCd
      kpiTitle
      categoryCd
      chartType
      unit
      targetValue
      chartData
    }
  }
`;

/**
 * 구독 중인 KPI 지표 데이터 조회 쿼리 (지표별 필터 지원)
 * 각 KPI 지표에 대한 차트 데이터를 개별 필터로 조회
 */
export const GET_KPI_CHART_DATA = `
  query getKpiChartData($filters: [KpiSubscriptionFilter!]!) {
    getKpiChartData(filters: $filters) {
      kpiIndicatorCd
      kpiTitle
      categoryCd
      categoryNm
      chartType
      unit
      targetValue
      chartData
      __typename
    }
  }
`;

/**
 * KPI 필터 타입 정의
 * @typedef {Object} KpiFilter
 * @property {string} date - 기준 날짜
 * @property {string} range - 데이터 범위 (day, week, month)
 */

/**
 * KPI 지표별 필터 타입 정의
 * @typedef {Object} KpiSubscriptionFilter
 * @property {string} [kpiIndicatorCd] - KPI 지표 코드 (생략 시 사용자의 모든 구독 지표에 적용)
 * @property {string} date - 기준 날짜
 * @property {string} range - 데이터 범위 (day, week, month)
 */

/**
 * KPI 차트 데이터 타입 정의
 * @typedef {Object} KpiChartData
 * @property {string} kpiIndicatorCd - KPI 지표 코드
 * @property {string} kpiTitle - KPI 지표 제목
 * @property {string} categoryCd - 카테고리 코드
 * @property {string} categoryNm - 카테고리 이름
 * @property {string} chartType - 차트 타입 (line, bar 등)
 * @property {string} unit - 단위
 * @property {number} targetValue - 목표값
 * @property {Array<Object>} chartData - 차트 데이터
 */
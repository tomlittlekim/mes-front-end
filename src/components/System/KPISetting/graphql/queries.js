/**
 * 지점 및 회사 정보 조회 쿼리
 */
export const GET_BRANCH_COMPANIES = `
  query getBranchCompanies {
    getBranchCompanies {
      id
      name
      companies {
        id
        name
      }
    }
  }
`;

/**
 * KPI 지표 정보 조회 쿼리
 */
export const GET_KPI_INDICATORS = `
  query getKpiIndicators {
    getKpiIndicators {
      kpiIndicatorCd
      kpiIndicatorNm
      description
      categoryCd
      categoryNm
      targetValue
      unit
      chartType
    }
  }
`;

/**
 * 회사별 KPI 구독 정보 조회 쿼리
 */
export const GET_KPI_SUBSCRIPTIONS = `
  query getKpiSubscriptions {
    getKpiSubscriptions {
      site
      compCd
      kpiIndicatorCd
      categoryId
      description
      sort
      flagActive
    }
  }
`;

/**
 * KPI 설정 저장 뮤테이션
 */
export const SAVE_KPI_SETTINGS = `
  mutation saveKpiSettings($settings: [KPISettingInput!]!) {
    saveKpiSettings(settings: $settings) {
      success
      message
    }
  }
`;

/**
 * KPI 설정 입력 타입 정의
 */
export const KPI_SETTING_INPUT = `
  input KPISettingInput {
    site: String!
    compCd: String!
    kpiIndicatorCd: String!
    categoryId: String!
    description: String
    sort: Int
    flagActive: Boolean
  }
`;

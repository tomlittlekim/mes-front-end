import { graphFetch } from "../fetchConfig";

// =====================================================================
//      Report APIs (레포트)
// =====================================================================

// 주기별 생산 현황
const periodicProductionQuery = `
  query periodicProduction($filter: PlanVsActualFilter) {
    periodicProduction(filter: $filter) {
      materialName
      totalGoodQty
      totalDefectQty
      totalDefectRate
      unit
      productId
    }
  }
`;

// 불량 상세 정보
const getDefectInfoQuery = `
  query getDefectInfo($productId: String) {
    getDefectInfo(productId: $productId) {
      codeName
      codeDesc
      defectQty
    }
  }
`;

// 계획대비 실적
const planVsActualQuery = `
  query planVsActual($filter: PlanVsActualFilter) {
    planVsActual(filter: $filter) {
      prodPlanId
      planQty
      totalOrderQty
      completedOrderQty
      achievementRate
      materialName
      systemMaterialId
    }
  }
`;

// 자재 목록
const getMaterialsQuery = `
  query getMaterialNameAndSysId {
    getMaterialNameAndSysId {
      systemMaterialId
      materialName
    }
  }
`;

// 입출고 이력
const getInventoryHistoryListQuery = `
  query getInventoryHistoryList($filter: InventoryHistoryFilter) {
    getInventoryHistoryList(filter: $filter) {
      inOutType
      warehouseName
      supplierName
      manufacturerName
      materialName
      changeQty
      currentQty
      unit
      createDate
    }
  }
`;

// =============================
// Export Functions
// =============================

// 주기별 생산 현황 조회
export const getPeriodicProduction = async (filter = {}) => {
  const response = await graphFetch(periodicProductionQuery, { filter });
  return response.periodicProduction;
};

// 불량 상세 정보 조회
export const getDefectInfo = async (productId) => {
  const response = await graphFetch(getDefectInfoQuery, { productId });
  return response.getDefectInfo;
};

// 계획대비 실적 조회
export const getPlanVsActual = async (filter = {}) => {
  const response = await graphFetch(planVsActualQuery, { filter });
  return response.planVsActual;
};

// 자재 목록 조회
export const getMaterialList = async () => {
  const response = await graphFetch(getMaterialsQuery, {});
  return response.getMaterialNameAndSysId;
};

// 입출고 이력 조회
export const getInventoryHistoryList = async (filter = {}) => {
  const response = await graphFetch(getInventoryHistoryListQuery, { filter });
  return response.getInventoryHistoryList;
}; 
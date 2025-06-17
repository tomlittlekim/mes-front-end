import { graphFetch } from "../fetchConfig";

const getInventoryInManagementQuery = `
    query getInventoryInManagementList($filter: InventoryInManagementFilter) {
        getInventoryInManagementList(filter: $filter) {
          inManagementId
          inType
          factoryId
          warehouseId
          materialInfo
          totalPrice
          hasInvoice
          userName
          createDate
        }
      }
`;

const getInventoryInQuery = `
  query getInventoryInList($filter: InventoryInFilter) {
    getInventoryInList(filter: $filter) {
      inManagementId
      inInventoryId
      supplierName
      manufacturerName
      systemMaterialId
      materialName
      materialCategory
      materialStandard
      qty
      unitPrice
      unitVat
      totalPrice
      createUser
      createDate
      updateUser
      updateDate
    }
  }
`;

const saveInventoryInManagementMutation = `
  mutation saveInventoryInManagement($createdRows: [InventoryInManagementSaveInput]) {
    saveInventoryInManagement(createdRows: $createdRows)
  }
`;

const deleteInventoryInManagementMutation = `
  mutation deleteInventoryInManagement($inManagementId: InventoryInManagementDeleteInput!) {
    deleteInventoryInManagement(inManagementId: $inManagementId)
  }
`;

//여기는 InventoryIn(상세 등록, 수정, 삭제)
const saveInventoryInMutation = `
  mutation saveInventoryIn($createdRows: [InventoryInSaveInput], $updatedRows: [InventoryInUpdateInput]) {
    saveInventoryIn(createdRows: $createdRows, updatedRows: $updatedRows)
  }
`;

const deleteInventoryInMutation = `
  mutation deleteInventoryIn($inInventoryId: InventoryInDeleteInput!) {
    deleteInventoryIn(inInventoryId: $inInventoryId)
  }
`;

export const getInventoryInManagementList = async (filter = {}) => {
    const response = await graphFetch(getInventoryInManagementQuery, {filter});
    return response.getInventoryInManagementList
}

export const getInventoryInList = async (filter = {}) => {
    const response = await graphFetch(getInventoryInQuery, {filter});
    return response.getInventoryInList
}

export const saveInventoryInManagement = (req) => graphFetch(saveInventoryInManagementMutation, req);

export const deleteInventoryInManagement = (req) => graphFetch(deleteInventoryInManagementMutation, req);

export const saveInventoryIn = (req) => graphFetch(saveInventoryInMutation, req);

export const deleteInventoryIn = (req) => graphFetch(deleteInventoryInMutation, req);

// =============================
//      Inventory Status (재고 현황)
// =============================
const getInventoryStatusListQuery = `
    query getInventoryStatusList($filter: InventoryStatusFilter) {
      getInventoryStatusList(filter: $filter) {
        warehouseName
        supplierName
        manufacturerName
        systemMaterialId
        materialName
        unit
        qty
      }
    }
  `;
export const getInventoryStatusList = async (filter = {}) => {
  const response = await graphFetch(getInventoryStatusListQuery, { filter });
  return response.getInventoryStatusList;
};


// =============================
//      Inventory History (재고 이력)
// =============================
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
export const getInventoryHistoryList = async (filter = {}) => {
  const response = await graphFetch(getInventoryHistoryListQuery, { filter });
  return response.getInventoryHistoryList;
};


// =============================
//      Inventory Out (출고)
// =============================
const getInventoryOutManagementListQuery = `
      query getInventoryOutManagementList($filter: InventoryOutManagementFilter) {
        getInventoryOutManagementList(filter: $filter) {
          outManagementId
          outType
          factoryId
          warehouseId
          materialInfo
          totalPrice
          userName
          createDate
        }
      }
    `;

const getInventoryOutListQuery = `
      query getInventoryOutList($filter: InventoryOutFilter) {
        getInventoryOutList(filter: $filter) {
          outManagementId
          outInventoryId
          supplierName
          manufacturerName
          systemMaterialId
          materialName
          materialCategory
          materialStandard
          qty
          unitPrice
          unitVat
          totalPrice
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

const saveInventoryOutManagementMutation = `
    mutation saveInventoryOutManagement($createdRows: [InventoryOutManagementSaveInput]) {
        saveInventoryOutManagement(createdRows: $createdRows)
    }
`;

const deleteInventoryOutManagementMutation = `
    mutation deleteInventoryOutManagement($outManagementId: InventoryOutManagementDeleteInput!) {
        deleteInventoryOutManagement(outManagementId: $outManagementId)
    }
`;

const saveInventoryOutMutation = `
    mutation saveInventoryOut($createdRows: [InventoryOutSaveInput], $updatedRows: [InventoryOutUpdateInput]) {
        saveInventoryOut(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

const deleteInventoryOutMutation = `
    mutation deleteInventoryOut($outInventoryId: InventoryOutDeleteInput!) {
        deleteInventoryOut(outInventoryId: $outInventoryId)
    }
`;

export const getInventoryOutManagementList = async (filter = {}) => {
    const response = await graphFetch(getInventoryOutManagementListQuery, { filter });
    return response.getInventoryOutManagementList;
};

export const getInventoryOutList = async (filter = {}) => {
    const response = await graphFetch(getInventoryOutListQuery, { filter });
    return response.getInventoryOutList;
};

export const saveInventoryOutManagement = (req) => graphFetch(saveInventoryOutManagementMutation, req);

export const deleteInventoryOutManagement = (req) => graphFetch(deleteInventoryOutManagementMutation, req);

export const saveInventoryOut = (req) => graphFetch(saveInventoryOutMutation, req);

export const deleteInventoryOut = (req) => graphFetch(deleteInventoryOutMutation, req);

// =============================
//      Report APIs (레포트)
// =============================

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

// =============================
//      코드/마스터 데이터 API
// =============================

// 코드 조회
const getGridCodesQuery = `
  query getGridCodes($codeClassId: String!) {
    getGridCodes(codeClassId: $codeClassId) {
      codeId
      codeName
    }
  }
`;

// 공장 조회
const getGridFactoryQuery = `
  query getGridFactory {
    getGridFactory {
      factoryId
      factoryName
      factoryCode
    }
  }
`;

// 창고 조회
const getGridWarehouseQuery = `
  query getGridWarehouse {
    getGridWarehouse {
      warehouseId
      warehouseName
      warehouseType
    }
  }
`;

// 자재 코드 조회
const getMaterialCodeQuery = `
  query getMaterialCode {
    getMaterialCode {
      supplierId
      manufacturerName
      systemMaterialId
      materialName
      materialCategory
      unit
    }
  }
`;

// 코드 목록 조회
export const getGridCodes = async (codeClassId) => {
  const response = await graphFetch(getGridCodesQuery, { codeClassId });
  return response.getGridCodes;
};

// 공장 목록 조회
export const getGridFactory = async () => {
  const response = await graphFetch(getGridFactoryQuery, {});
  return response.getGridFactory;
};

// 창고 목록 조회
export const getGridWarehouse = async () => {
  const response = await graphFetch(getGridWarehouseQuery, {});
  return response.getGridWarehouse;
};

// 자재 코드 목록 조회
export const getMaterialCode = async () => {
  const response = await graphFetch(getMaterialCodeQuery, {});
  return response.getMaterialCode;
};
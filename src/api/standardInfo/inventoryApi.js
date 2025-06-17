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
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
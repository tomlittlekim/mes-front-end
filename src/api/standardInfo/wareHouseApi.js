import {graphFetch} from "../fetchConfig";


const warehouseInfoQuery = `
      query getWarehouse($filter: WarehouseFilter) {
        getWarehouse(filter: $filter) {
          factoryId
          factoryName
          warehouseId
          warehouseName
          warehouseType
          createUser
          createDate
          updateUser
          updateDate
        }
      }
`;

const saveWarehouseMutation = `
      mutation saveWarehouse($createdRows: [WarehouseInput], $updatedRows: [WarehouseUpdate]) {
        saveWarehouse(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

const deleteWarehouseMutation = `
      mutation deleteWarehouse($warehouseId: String!) {
        deleteWarehouse(warehouseId: $warehouseId)
      }
`;

/**
 * 창고 리스트를 불러오는 메소드
 * */
export const getWarehouse = async (filter = {}) => {
    const response = await graphFetch(warehouseInfoQuery, {filter});
    return response.getWarehouse
}

export const saveWarehouse = (req) => graphFetch(saveWarehouseMutation,req)

export const deleteWarehouse = (warehouseId) => graphFetch(deleteWarehouseMutation, warehouseId)
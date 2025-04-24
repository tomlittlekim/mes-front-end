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

export const getWarehouse = async (filter = {}) => {
    const response = await graphFetch(warehouseInfoQuery, {filter});
    return response.getWarehouse
}

export const saveWarehouse = (req) => graphFetch(saveWarehouseMutation,req)

export const deleteWarehouse = (warehouseId) => graphFetch(deleteWarehouseMutation, warehouseId)

// 창고 정보 조회 쿼리
const getWarehouseQuery = `
  query getWarehouse($filter: WarehouseFilter) {
    getWarehouse(filter: $filter) {
      warehouseId
      warehouseName
      factoryId
      factoryName
      warehouseType
    }
  }
`;

/**
 * 타입에 따른 창고 목록 조회
 * @param {string} warehouseType - 창고 타입 (예: "PRODUCT_WAREHOUSE")
 * @returns {Promise<Array>} 창고 목록
 */
export const getWarehouseByType = async (warehouseType) => {
  const filter = {
    factoryId: "",
    factoryName: "",
    warehouseId: "",
    warehouseName: "",
    warehouseType: warehouseType || "PRODUCT_WAREHOUSE"
  };

  const response = await graphFetch(getWarehouseQuery, { filter });
  
  if (response.errors) {
    console.error("창고 정보 조회 중 오류 발생:", response.errors);
    return [];
  }
  
  // 포맷팅된 데이터 반환
  return response.getWarehouse.map(warehouse => ({
    value: warehouse.warehouseId,
    label: warehouse.warehouseName || warehouse.warehouseId,
    factoryId: warehouse.factoryId,
    factoryName: warehouse.factoryName,
    warehouseType: warehouse.warehouseType
  }));
};
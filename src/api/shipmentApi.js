import { graphFetch } from './fetchConfig';

// 출하 헤더 목록 조회 쿼리
const GET_SHIPMENT_HEADERS = `
  query GetShipmentHeaders($req: ShipmentSearchRequest) {
    getShipmentHeaders(req: $req) {
      id
      site
      compCd
      orderNo
      orderDate
      orderer
      orderQuantity
      customerId
      totalAmount
      shipmentStatus
      shippedQuantity
      unshippedQuantity
      remark
      flagPrint
    }
  }
`;

// 출하 상세 목록 조회 쿼리
const GET_SHIPMENT_DETAILS = `
  query GetShipmentDetails($id: Int) {
    getShipmentDetails(id: $id) {
      id
      site
      compCd
      orderNo
      orderSubNo
      systemMaterialId
      materialName
      materialStandard
      unit
      quantity
      stockQuantity
      shipmentId
      shipmentDate
      shippedQuantity
      unshippedQuantity
      cumulativeShipmentQuantity
      shipmentWarehouse
      shipmentHandler
      remark
    }
  }
`;

// 품목ID로 창고 조회 쿼리 추가
const GET_WAREHOUSE_BY_MATERIAL_ID = `
  query GetWarehouseByMaterialId($materialId: String!) {
    getWarehouseByMaterialId(materialId: $materialId) {
      warehouseId
      warehouseName
    }
  }
`;

// 출하 상세 등록을 위한 데이터 준비 쿼리 수정
const PREPARE_SHIPMENT_DETAILS = `
  query PrepareShipmentDetailsForEntry($req: ShipmentDetailEntryRequest!) {
    prepareShipmentDetailsForEntry(req: $req) {
      id
      site
      compCd
      orderNo
      orderSubNo
      systemMaterialId
      materialName
      materialStandard
      unit
      quantity
      stockQuantity
      shipmentId
      shipmentDate
      shippedQuantity
      unshippedQuantity
      shipmentWarehouse
    }
  }
`;

// 출하 상세 저장/수정 뮤테이션
const UPSERT_SHIPMENT_DETAILS = `
  mutation UpsertShipmentDetails($list: [ShipmentDetailRequest]!) {
    upsertShipmentDetails(list: $list)
  }
`;

// 출하 삭제 뮤테이션
const SOFT_DELETE_SHIPMENT = `
  mutation SoftDeleteShipment($shipmentId: Int!) {
    softDeleteShipment(shipmentId: $shipmentId)
  }
`;

const vendorQuery = `
  query {
    getVendorsBySameCompany {
      vendorId
      vendorName
    }
  }
`;

const initialCodeQuery = `
  query getInitialCodes($codeClassId: String!) {
    getInitialCodes(codeClassId: $codeClassId) {
      codeId
      codeName
    }
  }
`;

// 주문번호로 품목 조회 쿼리 추가
const GET_MATERIAL_BY_ORDER_NO = `
  query GetMaterialByOrderNo($orderNo: String!) {
    getMaterialByOrderNo(orderNo: $orderNo) {
      systemMaterialId
      materialName
      orderSubNo
    }
  }
`;

// API 함수들
export const getShipmentHeaders = async (searchParams = {}) => {
  const result = await graphFetch(GET_SHIPMENT_HEADERS, { req: searchParams });
  return result.getShipmentHeaders;
};

export const getShipmentDetails = async (id) => {
  const result = await graphFetch(GET_SHIPMENT_DETAILS, { id });
  return result.getShipmentDetails;
};

export const prepareShipmentDetailsForEntry = async (orderNo, orderSubNo, warehouseId) => {
  const result = await graphFetch(PREPARE_SHIPMENT_DETAILS, { 
    req: { 
      orderNo,
      orderSubNo,
      warehouseId
    } 
  });
  return result.prepareShipmentDetailsForEntry;
};

export const getWarehouseByMaterialId = async (materialId) => {
  const result = await graphFetch(GET_WAREHOUSE_BY_MATERIAL_ID, { materialId });
  return result.getWarehouseByMaterialId;
};

export const upsertShipmentDetails = async (list) => {
  const result = await graphFetch(UPSERT_SHIPMENT_DETAILS, { list });
  return result.upsertShipmentDetails;
};

export const softDeleteShipment = async (shipmentId) => {
  const result = await graphFetch(SOFT_DELETE_SHIPMENT, { shipmentId });
  return result.softDeleteShipment;
};

// 고객사 셀렉트 박스 용
export const getVendors = async () => {
  const result = await graphFetch(vendorQuery);
  return result.getVendorsBySameCompany;
}

// 출하 상태 셀렉트 박스 용
export const getShipmentStatus = async () => {
  const result = await graphFetch(initialCodeQuery, {codeClassId: 'SHIPMENT_STATUS'});
  return result.getInitialCodes;
}

// getMaterialByOrderNo 함수 추가
export const getMaterialByOrderNo = async (orderNo) => {
  const result = await graphFetch(GET_MATERIAL_BY_ORDER_NO, { orderNo });
  return result.getMaterialByOrderNo;
};
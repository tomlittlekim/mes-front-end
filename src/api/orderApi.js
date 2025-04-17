import { graphFetch } from './fetchConfig';
import searchCondition from "../components/Common/SearchCondition";

// 주문 헤더 목록 조회 쿼리
const orderHeadersQuery = `
  query orderHeaders($req: OrderHeaderSearchRequest) {
    orderHeaders(req: $req) {
      id
      site
      compCd
      orderNo
      orderDate
      customerId
      totalAmount
      vatAmount
      flagVatAmount
      finalAmount
      deliveryDate
      paymentMethod
      deliveryAddr
      remark
      updateDate
      updateUser
      createDate
      createUser
      flagActive
    }
  }
`;

// 주문 헤더 단건 생성용 기본값 생성 쿼리
const newOrderHeaderQuery = `
  query newOrderHeader($no: Int!) {
    newOrderHeader(no: $no) {
      id
      site
      compCd
      orderNo
      orderDate
      customerId
      totalAmount
      vatAmount
      flagVatAmount
      finalAmount
      deliveryDate
      paymentMethod
      deliveryAddr
      remark
      updateDate
      updateUser
      createDate
      createUser
      flagActive
    }
  }
`;

// 주문 상세 목록 조회 쿼리
const orderDetailsQuery = `
  query orderDetails($orderNo: String!) {
    orderDetails(orderNo: $orderNo) {
      id
      site
      compCd
      orderNo
      orderSubNo
      systemMaterialId
      materialName
      materialStandard
      unit
      deliveryDate
      quantity
      unitPrice
      supplyPrice
      vatPrice
      totalPrice
      remark
      updateDate
      updateUser
      createDate
      createUser
      flagActive
    }
  }
`;

// 주문 상세 단건 생성용 기본값 생성 쿼리
const newOrderDetailQuery = `
  query newOrderDetail($req: newOrderDetailRequest!) {
    newOrderDetail(req: $req) {
      id
      site
      compCd
      orderNo
      orderSubNo
      systemMaterialId
      materialName
      materialStandard
      unit
      deliveryDate
      quantity
      unitPrice
      supplyPrice
      vatPrice
      totalPrice
      remark
      updateDate
      updateUser
      createDate
      createUser
      flagActive
    }
  }
`;

// 주문 헤더 저장/수정 뮤테이션
const upsertOrderHeadersMutation = `
  mutation upsertOrderHeaders($list: [OrderHeaderRequest]!) {
    upsertOrderHeaders(list: $list)
  }
`;

// 주문 상세 저장/수정 뮤테이션
const upsertOrderDetailsMutation = `
  mutation upsertOrderDetails($list: [OrderDetailRequest]!) {
    upsertOrderDetails(list: $list)
  }
`;

// 주문 헤더 삭제 뮤테이션
const deleteOrderHeaderMutation = `
  mutation deleteOrderHeader($id: Int!) {
    deleteOrderHeader(id: $id)
  }
`;

// 주문 상세 삭제 뮤테이션
const deleteOrderDetailMutation = `
  mutation deleteOrderDetail($id: Int!) {
    deleteOrderDetail(id: $id)
  }
`;

const vendorQuery = `
  query {
    getVendorsBySameCompany {
      vendorId
      vendorName
    }
  }`

const materialQuery = `
  query {
    getProductsBySelectBox {
      systemMaterialId
      materialName
    }
  }`

// API 함수들
export const getOrderHeaders = async (searchCondition = {}) => {
  const result = await graphFetch(orderHeadersQuery, { req: searchCondition });
  return result.orderHeaders;
};

export const getNewOrderHeader = async (no) => {
  const result = await graphFetch(newOrderHeaderQuery, { no });
  return result.newOrderHeader;
};

export const getOrderDetails = async (orderNo) => {
  const result = await graphFetch(orderDetailsQuery, { orderNo });
  return result.orderDetails;
};

export const getNewOrderDetail = async (req) => {
  const result = await graphFetch(newOrderDetailQuery, { req });
  return result.newOrderDetail;
};

export const upsertOrderHeaders = async (list) => {
  const result = await graphFetch(upsertOrderHeadersMutation, { list });
  return result.upsertOrderHeaders;
};

export const upsertOrderDetails = async (list) => {
  const result = await graphFetch(upsertOrderDetailsMutation, { list });
  return result.upsertOrderDetails;
};

export const deleteOrderHeader = async (id) => {
  const result = await graphFetch(deleteOrderHeaderMutation, { id });
  return result.deleteOrderHeader;
};

export const deleteOrderDetail = async (id) => {
  const result = await graphFetch(deleteOrderDetailMutation, { id });
  return result.deleteOrderDetail;
};

// 고객사 셀렉트 박스 용
export const getVendors = async () => {
  const result = await graphFetch(vendorQuery);
  return result.getVendorsBySameCompany;
}

// 완제품, 반제품 셀렉트 박스 용
export const getProducts = async () => {
  const result = await graphFetch(materialQuery);
  return result.getProductsBySelectBox;
}

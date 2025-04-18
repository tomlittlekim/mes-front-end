// 검색 조건 기본값
export const SEARCH_CONDITIONS = {
    productId: ""
};

// 신규 생산실적 기본값
export const NEW_PRODUCTION_RESULT = {
    workOrderId: "",
    productId: "",
    goodQty: 0,
    defectQty: 0,
    equipmentId: "",
    resultInfo: "",
    defectCause: "",
    prodStartTime: null,
    prodEndTime: null,
    flagActive: true
};

// 신규 불량정보 기본값
export const NEW_DEFECT_INFO = {
    defectType: "불량정보등록",
    defectQty: 0,
    defectReason: ""
}; 
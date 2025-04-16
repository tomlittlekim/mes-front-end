// 검색 조건 초기값
export const SEARCH_CONDITIONS = {
  equipmentId: '',
  productId: '',
  fromDate: null,
  toDate: null
};

// 불량유형 목록
export const DEFECT_TYPES = [
  { value: 'APPEARANCE', label: '외관불량' },
  { value: 'FUNCTIONAL', label: '기능불량' },
  { value: 'DIMENSION', label: '치수불량' },
  { value: 'MATERIAL', label: '재질불량' },
  { value: 'PROCESS', label: '공정불량' },
  { value: 'PACKAGE', label: '포장불량' },
  { value: 'OTHER', label: '기타' }
];

// 근무타입 목록
export const SHIFT_TYPES = [
  { value: 'DAY', label: '주간' },
  { value: 'NIGHT', label: '야간' }
];

// 생산실적 상태 계산 함수
export const getProductionStatus = (goodQty, defectQty, progressRate) => {
  if (!goodQty && !defectQty) return 'NOT_STARTED';
  if (progressRate >= 100) return 'COMPLETED';
  return 'IN_PROGRESS';
};

// 상태 텍스트 반환
export const getStatusText = (status) => {
  switch (status) {
    case 'NOT_STARTED': return '미진행';
    case 'IN_PROGRESS': return '진행중';
    case 'COMPLETED': return '완료';
    case 'PLANNED': return '계획됨';
    default: return status || '미진행';
  }
};

// 빈 생산실적 폼 데이터
export const EMPTY_PRODUCTION_FORM = {
  workOrderId: '',
  productId: '',
  productName: '',
  equipmentId: '',
  equipmentName: '',
  prodDate: new Date(),
  goodQty: 0,
  defectQty: 0,
  progressRate: 0,
  defectRate: 0,
  shiftType: 'DAY',
  workers: '',
  memo: ''
};
/**
 * 불량정보 데이터를 그리드 표시용으로 변환하는 함수
 * 
 * @param {Object} responseData - API에서 응답받은 원본 데이터
 * @returns {Array} 데이터그리드에 표시할 데이터 배열
 */
export const formatDefectInfoData = (responseData) => {
  // API 응답이 없거나 데이터가 없는 경우 빈 배열 반환
  if (!responseData || !responseData.allDefectInfos) {
    return [];
  }

  // 불량 정보 추출
  const defectInfos = responseData.allDefectInfos;

  // 데이터그리드에 표시할 형식으로 데이터 변환
  return defectInfos.map((defect, index) => {
    return {
      ...defect,
      id: defect.id || index, // id가 없을 경우 인덱스로 대체
      defectQty: defect.defectQty ? parseFloat(defect.defectQty) : 0, // 불량수량 숫자 형식으로 변환
    };
  });
};

/**
 * 불량 상태에 따른 표시 이름 반환
 * 
 * @param {string} state - 불량 상태 코드
 * @returns {string} 불량 상태 표시 이름
 */
export const getDefectStateName = (state) => {
  if (!state) return '-';

  // 불량 상태 코드에 따른 표시 이름 매핑
  const stateMap = {
    'REGISTERED': '등록됨',
    'ANALYZED': '분석됨',
    'CLOSED': '종결됨',
    'PENDING': '대기중'
  };

  return stateMap[state] || state;
};

/**
 * 불량 상태에 따른 CSS 클래스 반환
 * 
 * @param {string} state - 불량 상태 코드
 * @returns {string} CSS 클래스 이름
 */
export const getDefectStateClass = (state) => {
  if (!state) return '';

  // 불량 상태 코드에 따른 CSS 클래스 매핑
  const stateClassMap = {
    'REGISTERED': 'status-pending',
    'ANALYZED': 'status-pending',
    'CLOSED': 'status-active',
    'PENDING': 'status-inactive'
  };

  return stateClassMap[state] || '';
}; 
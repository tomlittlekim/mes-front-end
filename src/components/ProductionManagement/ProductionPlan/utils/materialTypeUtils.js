/**
 * materialTypeUtils.js - 제품 유형 관련 유틸리티 함수 모음
 */

/**
 * MaterialType 코드값을 한글 표시값으로 변환하는 객체
 */
export const materialTypeMap = Object.freeze({
  'COMPLETE_PRODUCT': '완제품',
  'HALF_PRODUCT': '반제품',
  'RAW_MATERIAL': '원자재',
  'SUB_MATERIAL': '부자재'
});

/**
 * MaterialType 코드값을 한글 표시값으로 변환하는 함수
 *
 * @param {string} typeCode - MaterialType 코드값
 * @returns {string} - 한글 표시값 또는 원래 코드값
 */
export const getMaterialTypeDisplay = (typeCode) => {
  return materialTypeMap[typeCode] || typeCode || '기타';
};

/**
 * 제품 정보와 함께 한글 표시값을 포함한 확장 제품 정보를 생성하는 함수
 *
 * @param {Object} product - 원본 제품 정보
 * @returns {Object} - 표시값이 추가된 확장 제품 정보
 */
export const enrichProductWithDisplayValues = (product) => {
  if (!product) return null;

  return {
    ...product,
    materialTypeDisplay: getMaterialTypeDisplay(product.materialType)
  };
};

export default {
  materialTypeMap,
  getMaterialTypeDisplay,
  enrichProductWithDisplayValues
};
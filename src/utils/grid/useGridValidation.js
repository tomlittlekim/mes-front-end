import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import Message from '../message/Message';

/**
 * 필수 필드 렌더링 함수
 * @param {Object} params - 셀 파라미터
 * @param {string} field - 필드명
 * @param {Object} options - 추가 옵션 (예: valueOptions)
 * @returns {JSX.Element} 렌더링된 셀
 */
export const renderRequiredCell = (params, field, options = {}) => {
  const { valueOptions = [] } = options;
  
  if (!params.value) {
    return <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>필수</Box>;
  }

  // valueOptions가 있는 경우 (드롭다운)
  if (valueOptions.length > 0) {
    const option = valueOptions.find(opt => opt.value === params.value);
    return option?.label || params.value;
  }

  return params.value;
};

/**
 * 에러 메시지 그룹화 함수
 * @param {Object} errors - 에러 객체
 * @param {Array} columns - 그리드 컬럼 정의
 * @returns {string} 그룹화된 에러 메시지
 */
const groupErrorMessages = (errors, columns) => {
  // 필수값 에러와 커스텀 에러를 분리
  const requiredErrors = new Set();
  const customErrors = new Set();
  
  // required 필드의 headerName 매핑 생성
  const requiredFieldNames = columns.reduce((acc, col) => {
    if (col.required) {
      acc[col.field] = col.headerName;
    }
    return acc;
  }, {});
  
  Object.values(errors).forEach(rowErrors => {
    Object.entries(rowErrors).forEach(([field, message]) => {
      // 필드명이 message와 같은 경우는 필수값 에러
      if (field === message) {
        requiredErrors.add(requiredFieldNames[field]); // headerName 사용
      } else {
        customErrors.add(message);
      }
    });
  });

  const messages = [];
  
  // 필수값 에러 메시지
  const requiredFieldsList = Array.from(requiredErrors);
  if (requiredFieldsList.length > 0) {
    messages.push(`${requiredFieldsList.join(', ')}은(는) 필수값입니다.`);
  }

  // 커스텀 에러 메시지
  const customMessages = Array.from(customErrors);
  if (customMessages.length > 0) {
    messages.push(customMessages.join(', '));
  }

  return messages.join('\n');
};

/**
 * 그리드 validation을 위한 공용 훅
 * @param {Object} options - validation 옵션
 * @param {Array} options.columns - 그리드 컬럼 정의
 * @param {Function} options.customValidation - 커스텀 validation 함수
 * @returns {Object} validation 관련 함수들
 */
export const useGridValidation = ({ columns = [], customValidation = null }) => {
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * 행 데이터 validation
   * @param {Object} row - 검증할 행 데이터
   * @returns {Object} validation 결과
   */
  const validateRow = useCallback((row) => {
    const errors = {};

    // 필수 필드 검증
    columns.forEach(col => {
      if (col.required && !row[col.field]) {
        errors[col.field] = col.field; // 필드명을 메시지로 사용
      }
    });

    // 커스텀 validation
    if (customValidation) {
      const customErrors = customValidation(row);
      Object.assign(errors, customErrors);
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [columns, customValidation]);

  /**
   * 여러 행 데이터 validation
   * @param {Array} rows - 검증할 행 데이터 배열
   * @returns {Object} validation 결과
   */
  const validateRows = useCallback((rows) => {
    const results = rows.map(row => validateRow(row));
    const isValid = results.every(result => result.isValid);
    const errors = results.reduce((acc, result, index) => {
      if (!result.isValid) {
        acc[index] = result.errors;
      }
      return acc;
    }, {});

    setValidationErrors(errors);

    if (!isValid) {
      const errorMessage = groupErrorMessages(errors, columns);
      Message.showWarning(errorMessage);
    }

    return {
      isValid,
      errors
    };
  }, [validateRow, columns]);

  return {
    validateRow,
    validateRows,
    validationErrors,
    renderRequiredCell
  };
}; 
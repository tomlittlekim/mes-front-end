// ProductMaterialSelector.js - 생산실적등록용으로 수정
import React, { useEffect, useState, useMemo } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';

/**
 * 제품 선택용 커스텀 에디터 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (DataGrid에서 전달되는 props)
 * @param {Array} props.productMaterials - 제품 정보 목록
 * @param {String} props.field - 필드명 ('productId' 또는 'productName')
 * @returns {JSX.Element}
 */
const ProductMaterialSelector = (props) => {
  const { id, field, value, api, productMaterials = [] } = props;
  const [inputValue, setInputValue] = useState('');

  // MaterialType 코드값을 한글 표시값으로 변환하는 맵 정의
  const materialTypeMap = useMemo(() => ({
    'COMPLETE_PRODUCT': '완제품',
    'HALF_PRODUCT': '반제품',
    'RAW_MATERIAL': '원자재',
    'SUB_MATERIAL': '부자재'
  }), []);

  // 제품 정보를 변환하여 옵션 목록 생성
  const options = useMemo(() => {
    if (!productMaterials || productMaterials.length === 0) return [];

    return productMaterials.map(product => ({
      id: product.systemMaterialId || product.value,
      userMaterialId: product.userMaterialId || product.value || '',
      materialName: product.materialName || product.label || '',
      materialCategory: product.materialCategory || '',
      materialType: product.materialType || '',
      materialTypeDisplay: materialTypeMap[product.materialType] || product.materialType || '기타', // 한글 표시값 추가
      materialStandard: product.materialStandard || '',
      unit: product.unit || ''
    }));
  }, [productMaterials, materialTypeMap]);

  // 현재 선택된 옵션 찾기 (field에 따라 다른 방식으로 찾기)
  const selectedOption = field === 'productId'
      ? options.find(option => option.id === value)
      : options.find(option => option.materialName === value);

  // 초기 로드 시 value 설정 - 항상 호출되도록 조건부 코드를 useEffect 내부로 이동
  useEffect(() => {
    if (selectedOption) {
      if (field === 'productId') {
        setInputValue(selectedOption.userMaterialId || selectedOption.id || '');
      } else if (field === 'productName') {
        setInputValue(selectedOption.materialName || '');
      }
    } else {
      setInputValue('');
    }
  }, [field, selectedOption]);

  // 제품 정보가 없는 경우 처리
  if (!productMaterials || productMaterials.length === 0) {
    return (
        <TextField
            variant="outlined"
            size="small"
            fullWidth
            disabled
            placeholder="제품 정보 없음"
            sx={{ m: 0, p: 0 }}
        />
    );
  }

  // 옵션 선택 시 이벤트 핸들러
  const handleChange = (event, newValue) => {
    if (newValue) {
      // 현재 전체 행 데이터 가져오기
      const rowModel = api.getRow(id);

      if (!rowModel) return;

      // 업데이트할 새 행 데이터 생성
      const updatedRow = {
        ...rowModel,
        productId: newValue.id,  // systemMaterialId 저장 (백엔드 처리용)
        productName: newValue.materialName,
        materialCategory: newValue.materialCategory || '', // 제품유형 필드 업데이트
        // 여기서는 userMaterialId는 표시용으로만 사용하고, 실제 저장되는 값은 systemMaterialId
      };

      // 두 필드 모두 업데이트
      api.updateRows([updatedRow]);

      // 현재 편집 중인 셀의 값 업데이트
      const fieldValue = field === 'productId' ? newValue.id : newValue.materialName;
      api.setEditCellValue({ id, field, value: fieldValue });

      // 편집 완료
      setTimeout(() => {
        try {
          // 최신 버전의 DataGrid API 사용
          if (api.stopCellEditMode) {
            api.stopCellEditMode({ id, field });
          }
          // 이전 버전의 DataGrid API 사용을 시도
          else if (api.commitCellChange) {
            api.commitCellChange({ id, field });
            api.setCellMode(id, field, 'view');
          }
          // 둘 다 없는 경우에는 setCellMode만 시도
          else {
            api.setCellMode(id, field, 'view');
          }
        } catch (error) {
          console.error('셀 편집 모드 종료 중 오류:', error);
          // 오류 발생 시 적어도 셀 모드를 view로 전환 시도
          try {
            api.setCellMode(id, field, 'view');
          } catch {}
        }
      }, 200);
    }
  };

  // 필드별로 다른 레이블과 옵션 표시
  const getOptionLabel = (option) => {
    if (field === 'productId') {
      return option.userMaterialId || option.id || '';
    } else {
      return option.materialName || '';
    }
  };

  return (
      <Autocomplete
          value={selectedOption}
          onChange={handleChange}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(option, value) =>
              option && value && (
                  (field === 'productId' && option.id === value.id) ||
                  (field === 'productName' && option.materialName === value.materialName)
              )
          }
          renderInput={(params) => (
              <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder={field === 'productId' ? "제품ID 선택" : "제품명 선택"}
                  sx={{ m: 0, p: 0 }}
              />
          )}
          renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <strong>{option.userMaterialId || option.id || ''}</strong> - {option.materialName}
                  {option.materialStandard && <span style={{ color: 'gray', marginLeft: '8px' }}>({option.materialStandard})</span>}
                </Box>
              </li>
          )}
          groupBy={(option) => {
            // materialType을 한글명으로 표시
            const typeDisplay = option.materialTypeDisplay || '기타';
            const categoryDisplay = option.materialCategory || '일반';
            return `${typeDisplay} > ${categoryDisplay}`;
          }}
          disableClearable
          fullWidth
          autoHighlight
          openOnFocus
          sx={{ width: '100%' }}
      />
  );
};

export default ProductMaterialSelector;
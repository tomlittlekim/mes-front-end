import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CircleIcon from "@mui/icons-material/Circle";
import { getMaterialTypeColor } from "../RawSubMaterial/utils/styleUtils";

/**
 * 자재 타입에 따른 렌더링 컴포넌트
 *
 * @param {Object} params - DataGrid 셀 파라미터
 * @returns {JSX.Element} - 자재 타입 칩 컴포넌트
 */
export const materialTypeRenderCell = (params) => {
  // 자재 타입에 따른 색상 설정
  const materialType = params.value;
  const color = getMaterialTypeColor(materialType);

  // 각 자재 타입별 표시 텍스트 설정
  let label = materialType;
  switch (materialType) {
    case 'RAW_MATERIAL':
      label = '원자재';
      break;
    case 'SUB_MATERIAL':
      label = '부자재';
      break;
    case 'HALF_PRODUCT':
      label = '반제품';
      break;
    case 'COMPLETE_PRODUCT':
      label = '완제품';
      break;
    default:
      label = materialType;
  }

  return (
      <Chip
          size="small"
          variant="outlined"
          icon={<CircleIcon style={{ color: color }} />}
          label={label}
          sx={{
            '& .MuiChip-label': {
              color: color
            },
            borderColor: color
          }}
      />
  );
};
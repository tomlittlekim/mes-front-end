import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import InventoryIcon from '@mui/icons-material/Inventory';

/**
 * 자재 타입 표시용 렌더 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
export const MaterialTypeRenderer = (props) => {
  const { value } = props;
  
  // 자재 타입별 설정
  const typeConfig = {
    'RAW_MATERIAL': {
      label: '원자재',
      icon: <CategoryIcon fontSize="small" />,
      color: '#1976d2',
      backgroundColor: '#e3f2fd'
    },
    'SUB_MATERIAL': {
      label: '부자재',
      icon: <BuildIcon fontSize="small" />,
      color: '#9c27b0',
      backgroundColor: '#f3e5f5'
    },
    'HALF_PRODUCT': {
      label: '반제품',
      icon: <ViewInArIcon fontSize="small" />,
      color: '#ed6c02',
      backgroundColor: '#fff3e0'
    },
    'COMPLETE_PRODUCT': {
      label: '제품',
      icon: <InventoryIcon fontSize="small" />,
      color: '#2e7d32',
      backgroundColor: '#e8f5e9'
    }
  };
  
  // 해당 타입에 대한 설정 가져오기 (기본값 설정도 함께)
  const config = typeConfig[value] || {
    label: value || '',
    icon: <CategoryIcon fontSize="small" />,
    color: '#757575',
    backgroundColor: '#f5f5f5'
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        variant="outlined"
        sx={{ 
          backgroundColor: config.backgroundColor,
          borderColor: config.color,
          color: config.color,
          fontWeight: 'medium',
          '& .MuiChip-icon': { 
            color: config.color
          }
        }}
      />
    </Box>
  );
};

/**
 * DataGrid의 materialType 컬럼에 적용할 렌더러
 */
export const materialTypeRenderCell = (params) => {
  return <MaterialTypeRenderer value={params.value} />;
};

export default {
  materialTypeRenderCell
};
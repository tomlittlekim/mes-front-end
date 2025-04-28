import React from 'react';
import { Chip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { getMaterialTypeColor } from '../utils/styleUtils';

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

/**
 * 자재 상태에 따른 렌더링 컴포넌트
 * 
 * @param {Object} params - DataGrid 셀 파라미터
 * @returns {JSX.Element} - 자재 상태 칩 컴포넌트
 */
export const materialStatusRenderCell = (params) => {
    const status = params.value;
    
    let color, label;
    switch (status) {
        case 'ACTIVE':
            color = '#4caf50';
            label = '사용';
            break;
        case 'INACTIVE':
            color = '#f44336';
            label = '미사용';
            break;
        default:
            color = '#9e9e9e';
            label = status;
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

export default {
    materialTypeRenderCell,
    materialStatusRenderCell
};
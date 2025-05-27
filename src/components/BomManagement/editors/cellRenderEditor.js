import React from 'react';
import {Box, Chip} from '@mui/material';
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


/**
 * 자재유형 코드를 한글명으로 변환하는 함수
 * @param {string} code - 자재유형 코드
 * @param {Array} materialCategoryOptions - 자재유형 옵션 목록
 * @returns {string} - 한글명
 */
export const getMaterialCategoryName = (code, materialCategoryOptions = []) => {
    if (!code || !materialCategoryOptions.length) return code;

    const category = materialCategoryOptions.find(option => option.value === code);
    return category ? category.label : code;
};

/**
 * 자재유형 셀 렌더링 컴포넌트
 * @param {Object} params - DataGrid 셀 파라미터
 * @returns {JSX.Element} - 자재유형 텍스트
 */
export const materialCategoryRenderCell = (params) => {
    const { value, api } = params;
    const materialCategoryOptions = api.getColumn('materialCategory').valueOptions || [];
    const categoryName = getMaterialCategoryName(value, materialCategoryOptions);

    return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            {categoryName}
        </Box>
    );
};


export default {
    materialTypeRenderCell,
    materialStatusRenderCell,
    materialCategoryRenderCell
};
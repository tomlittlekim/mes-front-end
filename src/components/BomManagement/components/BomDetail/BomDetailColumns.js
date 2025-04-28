import React from 'react';
import CellButton from "../../../Common/grid-piece/CellButton";
import { materialTypeRenderCell } from '../../editors/cellRenderEditor';

/**
 * BOM 상세 목록 그리드 컬럼 정의 함수
 * 
 * @param {Function} handleOpenMaterialSelectModal - 자재 선택 모달 열기 함수
 * @returns {Array} - 컬럼 정의 배열
 */
export const getBomDetailColumns = (handleOpenMaterialSelectModal) => [
    {
        field: 'systemMaterialId',
        headerName: '제품 설정',
        width: 70,
        renderCell: (params) => (
            <CellButton
                params={params}
                onClick={() => handleOpenMaterialSelectModal(params)}
                label="설정"
            />
        )
    },
    {field: 'bomLevel', headerName: 'BOM 레벨', width: 80, type: 'number', editable: true},
    {field: 'bomId', headerName: 'BOM ID', width: 80, hide: true},
    {field: 'bomDetailId', headerName: 'BOM Detail ID', width: 150, hide: true},
    {
        field: 'materialType',
        headerName: '종류',
        width: 100,
        type: 'singleSelect',
        valueOptions: [
            {value: 'RAW_MATERIAL', label: '원자재'},
            {value: 'SUB_MATERIAL', label: '부자재'},
            {value: 'HALF_PRODUCT', label: '반제품'}
        ],
        editable: true,
        renderCell: materialTypeRenderCell
    },
    {field: 'materialCategory', headerName: '유형', width: 60},
    {field: 'materialName', headerName: '제품명', width: 150, editable: true},
    {field: 'userMaterialId', headerName: '제품ID(사용자생성)', width: 150, editable: true},
    {field: 'parentItemCd', headerName: '상위품목ID(시스템생성)', width: 150, hide: true},
    {field: 'parentMaterialName', headerName: '상위제품명', width: 200, hide: true},
    {field: 'parentMaterialType', headerName: '상위제품종류', width: 200, hide: true},
    {field: 'userParentItemCd', headerName: '상위품목ID(사용자생성)', width: 150, editable: true},
    {field: 'materialStandard', headerName: '규격', width: 100},
    {field: 'unit', headerName: '단위', width: 80},
    {field: 'itemQty', headerName: '필요수량', width: 100, type: 'number', editable: true},
    {field: 'remark', headerName: '비고', width: 150, editable: true}
];

export default getBomDetailColumns; 
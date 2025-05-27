import React from 'react';
import CellButton from "../../../Common/grid-piece/CellButton";
import { materialTypeRenderCell } from '../../editors/cellRenderEditor';

/**
 * BOM 상세 목록 그리드 컬럼 정의 함수
 *
 * @returns {Array} - 컬럼 정의 배열
 */
export const getBomColumns = () => [
    {field: 'bomLevel', headerName: 'BOM 레벨', width: 80},
    {
        field: 'materialType',
        headerName: '종류',
        width: 100,
        type: 'singleSelect',
        valueOptions: [
            {value: 'COMPLETE_PRODUCT', label: '완제품'},
            {value: 'HALF_PRODUCT', label: '반제품'}
        ],
        renderCell: materialTypeRenderCell
    },
    {field: 'bomId', headerName: 'BOM ID', width: 100, hide: true},
    {field: 'materialName', headerName: '제품명', width: 100},
    {field: 'userMaterialId', headerName: '제품ID(사용자생성)', width: 150},
    // {field: 'bomName', headerName: 'BOM 명', width: 150},
    {field: 'materialCategory', headerName: '제품유형', width: 80},
    {field: 'systemMaterialId', headerName: '제품ID(시스템생성)', width: 150, hide: true},
    {field: 'materialStandard', headerName: '규격', width: 100},
    {field: 'unit', headerName: '단위', width: 80},
    {field: 'remark', headerName: '비고', width: 150},
    // {
    //     field: 'flagActive',
    //     headerName: '사용여부',
    //     width: 100,
    //     renderCell: materialStatusRenderCell
    // },
    // {field: 'createUser', headerName: '등록자', width: 100},
    // {field: 'createDate', headerName: '등록일', width: 150},
    // {field: 'updateUser', headerName: '수정자', width: 100},
    // {field: 'updateDate', headerName: '수정일', width: 150}
];

export default getBomColumns;
import React from 'react';
import { Grid, Box } from '@mui/material';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { materialTypeRenderCell } from '../../editors/cellRenderEditor';
import { renderRequiredCell } from '../../../../utils/grid/useGridValidation';

// 그리드 컬럼 정의
export const getColumns = ({
  unitOptions = [],
  materialCategoryOptions = [],
  rawSubTypeOptions = [],
  vendorOptions = []
}) => [
  {
    field: 'materialType', 
    headerName: '자재종류', 
    width: 100, 
    type: 'singleSelect',
    valueOptions: rawSubTypeOptions,
    editable: true,
    required: true,
    renderCell: (params) => {
      if (!params.value) {
        return <Box sx={{ color: 'error.main', fontWeight: 'bold' }}>필수</Box>;
      }
      return materialTypeRenderCell(params);
    }
  },
  {
    field: 'materialCategory', 
    headerName: '자재유형', 
    width: 100, 
    type: 'singleSelect',
    valueOptions: materialCategoryOptions,
    editable: true,
    required: true,
    renderCell: (params) => renderRequiredCell(params, 'materialCategory', { valueOptions: materialCategoryOptions })
  },
  {field: 'systemMaterialId', headerName: '시스템자재ID', width: 120},
  {
    field: 'userMaterialId', 
    headerName: '사용자자재ID', 
    width: 120, 
    editable: true,
    required: true,
    renderCell: (params) => renderRequiredCell(params, 'userMaterialId')
  },
  {
    field: 'materialName', 
    headerName: '자재명', 
    width: 150, 
    editable: true,
    required: true,
    renderCell: (params) => renderRequiredCell(params, 'materialName')
  },
  {field: 'materialStandard', headerName: '규격', width: 120, editable: true},
  {
    field: 'unit', 
    headerName: '단위', 
    width: 70, 
    type: 'singleSelect',
    valueOptions: unitOptions,
    editable: true,
    required: true,
    renderCell: (params) => renderRequiredCell(params, 'unit', { valueOptions: unitOptions })
  },
  {field: 'minQuantity', headerName: '최소수량', width: 80, type: 'number', editable: true},
  {field: 'maxQuantity', headerName: '최대수량', width: 80, type: 'number', editable: true},
  {field: 'manufacturerName', headerName: '제조사명', width: 120, editable: true},
  {
    field: 'supplierId', 
    headerName: '공급업체명', 
    width: 120, 
    type: 'singleSelect',
    valueOptions: vendorOptions,
    editable: true
  },
  { field: 'createUser', headerName: '작성자', width: 80},
  { field: 'createDate', headerName: '작성일', width: 100},
  { field: 'updateUser', headerName: '수정자', width: 80},
  { field: 'updateDate', headerName: '수정일', width: 100},
];

const MaterialGrid = ({
  materialList, 
  handleSelectionModelChange, 
  handleProcessRowUpdate, 
  handleRowAdd, 
  handleSave, 
  handleDelete,
  setMaterialList,
  generateId,
  tabId,
  // 드롭다운 옵션
  unitOptions,
  materialCategoryOptions,
  rawSubTypeOptions,
  vendorOptions
}) => {
  
  // 그리드 버튼 정의
  const gridButtons = [
    {label: '행추가', onClick: () => handleRowAdd(setMaterialList), icon: <AddIcon/>},
    {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
    {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
  ];
  
  // 드롭다운 옵션이 포함된 컬럼 생성
  const columns = getColumns({
    unitOptions,
    materialCategoryOptions,
    rawSubTypeOptions,
    vendorOptions
  });
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <EnhancedDataGridWrapper
          title="원부자재 목록"
          rows={materialList}
          columns={columns}
          buttons={gridButtons}
          height={590}
          tabId={tabId ? tabId + "-materials" : undefined}
          onRowClick={handleSelectionModelChange}
          gridProps={{
            editMode: 'cell',
            checkboxSelection: true,
            getRowId: (row) => row.id || generateId('TEMP'),
            onProcessUpdate: handleProcessRowUpdate,
            onSelectionModelChange: handleSelectionModelChange,
            columnVisibilityModel: {
              systemMaterialId: false,
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default MaterialGrid; 
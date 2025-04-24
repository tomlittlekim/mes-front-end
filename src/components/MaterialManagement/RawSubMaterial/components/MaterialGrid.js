import React from 'react';
import { Grid } from '@mui/material';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

// 그리드 컬럼 정의
export const COLUMNS = [
  {
    field: 'materialType', headerName: '자재종류', width: 100, type: 'singleSelect',
    valueOptions: [
      {value: 'RAW_MATERIAL', label: '원자재'},
      {value: 'SUB_MATERIAL', label: '부자재'}
    ], editable: true
  },
  {
    field: 'materialCategory', headerName: '자재유형', width: 100, type: 'singleSelect',
    valueOptions: [
      {value: '잉크', label: '잉크'},
      {value: '포장재', label: '포장재'}
    ], editable: true
  },
  {field: 'systemMaterialId', headerName: '시스템자재ID', width: 120},
  {field: 'userMaterialId', headerName: '사용자자재ID', width: 120, editable: true},
  {field: 'materialName', headerName: '자재명', width: 180, flex: 1, editable: true},
  {field: 'materialStandard', headerName: '규격', width: 120, editable: true},
  {
    field: 'unit', headerName: '단위', width: 70, type: 'singleSelect',
    valueOptions: [
      {value: 'EA', label: '개'},
      {value: 'roll', label: '롤'},
      {value: 'bottle', label: '병'},
      {value: 'pack', label: '팩'}
    ], editable: true
  },
  {field: 'minQuantity', headerName: '최소수량', width: 80, type: 'number', editable: true},
  {field: 'maxQuantity', headerName: '최대수량', width: 80, type: 'number', editable: true},
  {field: 'manufacturerName', headerName: '제조사명', width: 120, editable: true},
  {
    field: 'supplierId', headerName: '공급업체명', width: 120, type: 'singleSelect',
    valueOptions: [
      {value: 'SUP010', label: '광학용품마트'},
      {value: 'SUP018', label: '도서용품샵'},
      {value: 'SUP017', label: '제본재료마트'},
      {value: 'SUP016', label: '제본용품샵'}
    ], editable: true
  },
  { field: 'createUser', headerName: '작성자', width: 100},
  { field: 'createDate', headerName: '작성일', width: 200},
  { field: 'updateUser', headerName: '수정자', width: 100},
  { field: 'updateDate', headerName: '수정일', width: 200},
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
  tabId
}) => {
  
  // 그리드 버튼 정의
  const gridButtons = [
    {label: '행추가', onClick: () => handleRowAdd(setMaterialList), icon: <AddIcon/>},
    {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
    {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
  ];
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <EnhancedDataGridWrapper
          title="원부자재 목록"
          rows={materialList}
          columns={COLUMNS}
          buttons={gridButtons}
          height={450}
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
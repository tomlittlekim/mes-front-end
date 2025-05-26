import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Typography, FormControl, Select, MenuItem } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShiftTypeChip from './ShiftTypeChip';
import ProductMaterialSelector from '../../../ProductionManagement/ProductionPlan/editors/ProductMaterialSelector';

/**
 * 작업지시 목록 그리드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.workOrderList - 작업지시 목록 데이터
 * @param {Object} props.selectedPlan - 선택된 생산계획
 * @param {number} props.refreshKey - 새로고침 키
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onProcessRowUpdate - 행 업데이트 처리 핸들러
 * @param {Function} props.onAddWorkOrder - 작업지시 추가 핸들러
 * @param {Function} props.onSaveWorkOrder - 작업지시 저장 핸들러
 * @param {Function} props.onDeleteWorkOrder - 작업지시 삭제 핸들러
 * @param {Function} props.onStartWork - 작업 시작 핸들러
 * @param {Function} props.onCompleteWork - 작업 완료 핸들러
 * @param {string} props.tabId - 탭 ID
 * @param {Array} props.productMaterials - 제품 정보 목록
 * @returns {JSX.Element}
 */
const WorkOrderList = ({
  workOrderList,
  selectedPlan,
  refreshKey,
  onRowClick,
  onProcessRowUpdate,
  onAddWorkOrder,
  onSaveWorkOrder,
  onDeleteWorkOrder,
  onStartWork,
  onCompleteWork,
  tabId,
  productMaterials = []
}) => {
  // 선택된 행들을 추적하기 위한 ref와 상태
  const selectedRowIdsRef = useRef([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // 상태 옵션 정의
  const stateOptions = [
    { value: 'PLANNED', label: '계획됨' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'COMPLETED', label: '완료됨' },
    { value: 'CANCELED', label: '취소됨' }
  ];

  // 근무타입 옵션
  const shiftOptions = [
    { value: 'DAY', label: '주간' },
    { value: 'NIGHT', label: '야간' }
  ];

  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = useMemo(() => ([
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'prodPlanId',
      headerName: '생산계획ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID*',
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderEditCell: (params) => (
        <ProductMaterialSelector {...params} productMaterials={productMaterials} />
      ),
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');

        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');

        // productId(systemMaterialId)에 해당하는 userMaterialId 찾기
        const material = productMaterials.find(m => m.systemMaterialId === params.value);
        const displayValue = material ? material.userMaterialId : params.value;

        return (
            <Typography variant="body2" sx={{ color: showRequired ? '#f44336' : 'inherit' }}>
              {showRequired ? '필수 입력' : displayValue || ''}
            </Typography>
        );
      }
    },
    {
      field: 'productName',
      headerName: '제품명',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // productId를 이용해 제품명 찾기
        const material = productMaterials.find(m => m.systemMaterialId === params.row.productId);
        const displayValue = material ? material.materialName : '';

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'materialCategory',
      headerName: '제품유형',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // productId를 이용해 제품유형 찾기
        const material = productMaterials.find(m => m.systemMaterialId === params.row.productId);
        const displayValue = material ? material.materialCategory : '';

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'orderQty',
      headerName: '작업수량',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'shiftType',
      headerName: '근무타입',
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderEditCell: (params) => (
          <FormControl fullWidth>
            <Select
                value={params.value || 'DAY'}
                onChange={(e) => params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: e.target.value
                })}
                size="small"
            >
              {shiftOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
      ),
      renderCell: (params) => (
          <ShiftTypeChip type={params.value || 'DAY'} />
      )
    },
    {
      field: 'state',
      headerName: '상태',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderEditCell: (params) => (
          <FormControl fullWidth>
            <Select
                value={params.value || 'PLANNED'}
                onChange={(e) => params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: e.target.value
                })}
                size="small"
            >
              {stateOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
      ),
      renderCell: (params) => {
        const option = stateOptions.find(opt => opt.value === params.value);
        const label = option ? option.label : params.value;
        let className = '';

        // CSS 클래스 결정
        switch (params.value) {
          case 'PLANNED':
            className = 'status-planned';
            break;
          case 'IN_PROGRESS':
            className = 'status-inprogress';
            break;
          case 'COMPLETED':
            className = 'status-completed';
            break;
          case 'CANCELED':
            className = 'status-canceled';
            break;
          default:
            break;
        }

        return (
            <Typography variant="body2" className={className}>
              {label}
            </Typography>
        );
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    },
    {
      field: 'updateUser',
      headerName: '수정자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'updateDate',
      headerName: '수정일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    }
  ]), [shiftOptions, stateOptions, productMaterials]);

  // 선택 변경 핸들러
  const handleSelectionChange = useCallback((newSelectionModel) => {
    selectedRowIdsRef.current = newSelectionModel;
    setSelectedRowIds(newSelectionModel);
  }, []);

  // 다중 삭제 핸들러
  const handleMultipleDelete = useCallback(() => {
    let currentSelection = selectedRowIdsRef.current.length > 0 ? selectedRowIdsRef.current : selectedRowIds;
    
    // 백업 방법: DOM에서 직접 체크된 항목들 찾기
    if (!currentSelection || currentSelection.length === 0) {
      try {
        const checkedInputs = document.querySelectorAll('[data-testid="checkbox-selection-row"]:checked');
        const checkedRowIds = Array.from(checkedInputs).map(input => {
          const row = input.closest('[data-rowindex]');
          if (row) {
            const rowIndex = row.getAttribute('data-rowindex');
            return workOrderList[parseInt(rowIndex)]?.id;
          }
          return null;
        }).filter(id => id !== null);
        
        if (checkedRowIds.length > 0) {
          currentSelection = checkedRowIds;
        }
      } catch (error) {
        console.warn('DOM에서 선택된 행을 찾는 중 오류:', error);
      }
    }
    
    if (currentSelection && currentSelection.length > 0) {
      onDeleteWorkOrder(currentSelection);
    } else {
      onDeleteWorkOrder(); // 기존 방식 호환성을 위해 빈 배열 전달
    }
  }, [onDeleteWorkOrder, selectedRowIds, workOrderList]);

  // 다중 작업시작 핸들러
  const handleMultipleStartWork = useCallback(() => {
    let currentSelection = selectedRowIdsRef.current.length > 0 ? selectedRowIdsRef.current : selectedRowIds;
    
    // 백업 방법: DOM에서 직접 체크된 항목들 찾기
    if (!currentSelection || currentSelection.length === 0) {
      try {
        const checkedInputs = document.querySelectorAll('[data-testid="checkbox-selection-row"]:checked');
        const checkedRowIds = Array.from(checkedInputs).map(input => {
          const row = input.closest('[data-rowindex]');
          if (row) {
            const rowIndex = row.getAttribute('data-rowindex');
            return workOrderList[parseInt(rowIndex)]?.id;
          }
          return null;
        }).filter(id => id !== null);
        
        if (checkedRowIds.length > 0) {
          currentSelection = checkedRowIds;
        }
      } catch (error) {
        console.warn('DOM에서 선택된 행을 찾는 중 오류:', error);
      }
    }
    
    if (currentSelection && currentSelection.length > 0) {
      onStartWork(currentSelection);
    } else {
      onStartWork(); // 기존 방식 호환성을 위해 빈 배열 전달
    }
  }, [onStartWork, selectedRowIds, workOrderList]);

  // 다중 작업완료 핸들러
  const handleMultipleCompleteWork = useCallback(() => {
    let currentSelection = selectedRowIdsRef.current.length > 0 ? selectedRowIdsRef.current : selectedRowIds;
    
    // 백업 방법: DOM에서 직접 체크된 항목들 찾기
    if (!currentSelection || currentSelection.length === 0) {
      try {
        const checkedInputs = document.querySelectorAll('[data-testid="checkbox-selection-row"]:checked');
        const checkedRowIds = Array.from(checkedInputs).map(input => {
          const row = input.closest('[data-rowindex]');
          if (row) {
            const rowIndex = row.getAttribute('data-rowindex');
            return workOrderList[parseInt(rowIndex)]?.id;
          }
          return null;
        }).filter(id => id !== null);
        
        if (checkedRowIds.length > 0) {
          currentSelection = checkedRowIds;
        }
      } catch (error) {
        console.warn('DOM에서 선택된 행을 찾는 중 오류:', error);
      }
    }
    
    if (currentSelection && currentSelection.length > 0) {
      onCompleteWork(currentSelection);
    } else {
      onCompleteWork(); // 기존 방식 호환성을 위해 빈 배열 전달
    }
  }, [onCompleteWork, selectedRowIds, workOrderList]);

  // 작업지시 목록 그리드 버튼
  const workOrderGridButtons = useMemo(() => ([
    { label: '등록', onClick: onAddWorkOrder, icon: <AddIcon /> },
    { label: '저장', onClick: onSaveWorkOrder, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleMultipleDelete, icon: <DeleteIcon /> },
    { label: '작업시작', onClick: handleMultipleStartWork, icon: <PlayCircleOutlineIcon /> },
    { label: '작업완료', onClick: handleMultipleCompleteWork, icon: <CheckCircleOutlineIcon /> }
  ]), [onAddWorkOrder, onSaveWorkOrder, handleMultipleDelete, handleMultipleStartWork, handleMultipleCompleteWork]);

  // 그리드 속성 설정
  const gridProps = useMemo(() => ({
    editMode: 'cell',
    processRowUpdate: onProcessRowUpdate,
    onProcessRowUpdateError: (error) => {
      console.error('데이터 업데이트 오류:', error);
    }
  }), [onProcessRowUpdate]);

  // 초기 정렬 상태 설정 - 작업지시ID 역순
  const workOrderInitialState = useMemo(() => ({
    sorting: {
      sortModel: [{ field: 'workOrderId', sort: 'desc' }]
    }
  }), []);

  return (
      <EnhancedDataGridWrapper
          title={`작업지시목록 ${selectedPlan ? '- ' + selectedPlan.prodPlanId : ''}`}
          key={refreshKey + "-workorders"}
          rows={workOrderList}
          columns={workOrderColumns}
          buttons={workOrderGridButtons}
          height={450}
          onRowClick={onRowClick}
          tabId={tabId + "-work-orders"}
          gridProps={{
            ...gridProps,
            initialState: workOrderInitialState,
            checkboxSelection: true,
            onRowSelectionModelChange: handleSelectionChange,
            onSelectionModelChange: handleSelectionChange,
            rowSelectionModel: selectedRowIds,
            selectionModel: selectedRowIds
          }}
      />
  );
};

export default WorkOrderList;
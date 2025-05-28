import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Typography, Button, Stack, Select, MenuItem } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Swal from 'sweetalert2';
import ProductMaterialSelector from '../editors/ProductMaterialSelector';

/**
 * 생산실적 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionResultList = ({
  productionResultList,
  selectedWorkOrder,
  onRowClick,
  onCreateResult,
  onCreateIndependentResult,
  onSave,
  onDelete,
  equipmentOptions,
  productOptions,
  warehouseOptions = [],
  setProductionResultList,
  setProductionResult,
  productionResult,
  tabId,
  height = 350
}) => {
  // 선택된 행들을 추적하기 위한 ref와 상태
  const selectedRowIdsRef = useRef([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  // 생산실적 그리드 컬럼 정의
  const productionResultColumns = useMemo(() => ([
    {
      field: 'prodResultId',
      headerName: '생산실적ID',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value || '자동입력'}
          </Typography>
      )
    },
    // 제품ID 필드 (수정 불가)
    {
      field: 'productId',
      headerName: '제품ID* (수정불가)',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: false, // 무조건 수정 불가
      renderCell: (params) => {
        // systemMaterialId(실제 값)를 이용해 제품 찾기
        const product = productOptions?.find(p => p.systemMaterialId === params.value);
        if (product) {
          return (
              <Typography variant="body2">
                {/* 보여지는 값은 userMaterialId, 괄호 안에 materialName 표시 */}
                {product.userMaterialId || ''} {product.materialName ? `(${product.materialName})` : ''}
              </Typography>
          );
        }
        return (
            <Typography variant="body2" color="error">
              {params.value ? params.value : '필수 입력'}
            </Typography>
        );
      },
      description: '작업지시 기반으로 자동 설정되어 수정 불가'
    },
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value || '없음'}
          </Typography>
      )
    },
    {
      field: 'goodQty',
      headerName: '양품수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      editable: (params) => params.row.isNew === true,
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value !== null && params.value !== undefined
                ? Number(params.value).toLocaleString()
                : '0'}
          </Typography>
      )
    },
    {
      field: 'defectQty',
      headerName: '불량수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      editable: (params) => params.row.isNew === true,
      renderCell: (params) => (
          <Typography variant="body2" className={params.value > 0 ? "defect-highlight" : ""}>
            {params.value !== null && params.value !== undefined
                ? Number(params.value).toLocaleString()
                : '0'}
          </Typography>
      )
    },
    {
      field: 'productionQty',
      headerName: '생산수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      description: '양품수량과 불량수량의 합계',
      sortable: false,
      renderCell: (params) => {
        // 렌더링 시점에 직접 계산
        const goodQty = Number(params.row.goodQty) || 0;
        const defectQty = Number(params.row.defectQty) || 0;
        const total = goodQty + defectQty;

        return (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {total.toLocaleString()}
            </Typography>
        );
      }
    },
    // 생산시작일시 필드 (신규 등록시 수정 가능)
    {
      field: 'prodStartTime',
      headerName: '생산시작일시*',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: (params) => params.row.isNew === true,
      type: 'dateTime',
      valueGetter: (params) => {
        // params가 null이거나 undefined인 경우 체크
        if (!params) return null;
        
        // 문자열이나 다른 형식을 Date 객체로 변환
        if (!params.value) return null;
        try {
          return new Date(params.value);
        } catch (e) {
          console.error("Date conversion error:", e);
          return null;
        }
      },
      renderCell: (params) => {
        // params가 null이거나 undefined인 경우 체크
        if (!params) return <Typography variant="body2">-</Typography>;

        // params.row의 원본 데이터에서 직접 값을 가져옴
        const dateValue = params.row.prodStartTime;

        if (!dateValue) {
          return <Typography variant="body2">-</Typography>;
        }

        try {
          const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
          return (
              <Typography variant="body2">
                {!isNaN(date.getTime()) ? format(date, 'yyyy-MM-dd HH:mm') : '-'}
              </Typography>
          );
        } catch (e) {
          console.error("Date formatting error:", e);
          return <Typography variant="body2">-</Typography>;
        }
      }
    },
    // 생산종료일시 필드 (신규 등록시 수정 가능)
    {
      field: 'prodEndTime',
      headerName: '생산종료일시*',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: (params) => params.row.isNew === true,
      type: 'dateTime',
      valueGetter: (params) => {
        // params가 null이거나 undefined인 경우 체크
        if (!params) return null;
        
        // 문자열이나 다른 형식을 Date 객체로 변환
        if (!params.value) return null;
        try {
          return new Date(params.value);
        } catch (e) {
          console.error("Date conversion error:", e);
          return null;
        }
      },
      renderCell: (params) => {
        // params가 null이거나 undefined인 경우 체크
        if (!params) return <Typography variant="body2">-</Typography>;

        // params.row의 원본 데이터에서 직접 값을 가져옴
        const dateValue = params.row.prodEndTime;

        if (!dateValue) {
          return <Typography variant="body2">-</Typography>;
        }

        try {
          const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
          return (
              <Typography variant="body2">
                {!isNaN(date.getTime()) ? format(date, 'yyyy-MM-dd HH:mm') : '-'}
              </Typography>
          );
        } catch (e) {
          console.error("Date formatting error:", e);
          return <Typography variant="body2">-</Typography>;
        }
      }
    },
    {
      field: 'progressRate',
      headerName: '진척률',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      description: '양품수량 기준 누적 진척률',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value !== null && params.value !== undefined
                ? `${params.value}%`
                : '자동계산'}
          </Typography>
      )
    },
    {
      field: 'defectRate',
      headerName: '불량률',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      description: '현재 생산실적의 불량률',
      renderCell: (params) => (
          <Typography variant="body2" className={params.value > 0 ? "defect-highlight" : ""}>
            {params.value !== null && params.value !== undefined
                ? `${params.value}%`
                : '자동계산'}
          </Typography>
      )
    },
    {
      field: 'equipmentId',
      headerName: '설비ID',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: (params) => params.row.isNew === true,
      renderCell: (params) => {
        const equipment = equipmentOptions.find(e => e.value === params.value);
        return (
            <Typography variant="body2">
              {equipment ? (
                  <span>
                    {equipment.label}
                    {equipment.factoryName && equipment.lineName ? (
                        <span style={{ fontSize: '0.85em', color: 'gray', display: 'block' }}>
                          {equipment.factoryName} &gt; {equipment.lineName}
                        </span>
                    ) : null}
                  </span>
              ) : params.value || ''}
            </Typography>
        );
      }
    },
    // 창고 필드 (신규 등록시 수정 가능)
    {
      field: 'warehouseId',
      headerName: '창고*',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      editable: (params) => params.row?.isNew === true,
      type: 'singleSelect',
      valueOptions: warehouseOptions.map(option => ({
        value: option.value,
        label: option.label
      })),
      renderCell: (params) => {
        const warehouse = warehouseOptions.find(w => w.value === params.value);
        return (
            <Typography 
              variant="body2" 
              sx={{ 
                color: !params.value && params.row?.isNew ? 'error.main' : 'inherit',
                fontWeight: !params.value && params.row?.isNew ? 'bold' : 'normal'
              }}
            >
              {warehouse ? warehouse.label : (params.value || '선택 필요')}
            </Typography>
        );
      },
      renderEditCell: (params) => {
        const warehouse = warehouseOptions.find(w => w.value === params.value);
        return (
            <Select
                value={params.value || ''}
                onChange={(e) => {
                  params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: e.target.value
                  });
                  // 선택 후 자동으로 편집 모드 종료
                  params.api.stopCellEditMode({
                    id: params.id,
                    field: params.field
                  });
                }}
                fullWidth
                size="small"
                error={!params.value && params.row?.isNew}
                sx={{ 
                  minWidth: 120,
                  '& .MuiSelect-select': {
                    py: 0.5
                  }
                }}
            >
                <MenuItem value="" disabled>
                    <em>선택하세요</em>
                </MenuItem>
                {warehouseOptions.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        );
      },
      // valueSetter 대신 valueParser 사용
      valueParser: (value) => {
        return value || null;
      }
    },
    {
      field: 'createDate',
      headerName: '등록일시',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2">자동입력</Typography>;
        }

        try {
          const date = new Date(params.value);
          return (
              <Typography variant="body2">
                {!isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '자동입력'}
              </Typography>
          );
        } catch (e) {
          return <Typography variant="body2">자동입력</Typography>;
        }
      }
    }
  ]), [equipmentOptions, productOptions, warehouseOptions]);

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
            return productionResultList[parseInt(rowIndex)]?.id;
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
      // 선택된 생산실적들 중 실제 저장된 것들만 필터링 (prodResultId가 있는 것들)
      const selectedResults = productionResultList.filter(result => 
        currentSelection.includes(result.id) && result.prodResultId
      );
      
      if (selectedResults.length === 0) {
        Swal.fire({
          title: '알림',
          text: '삭제할 수 있는 생산실적이 없습니다. 저장되지 않은 임시 데이터는 목록에서 직접 제거해주세요.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      // 다중 삭제 확인 다이얼로그
      Swal.fire({
        title: '생산실적 삭제',
        text: `선택된 ${selectedResults.length}건의 생산실적을 삭제하시겠습니까?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      }).then((result) => {
        if (result.isConfirmed) {
          // prodResultId 목록 추출
          const prodResultIds = selectedResults.map(result => result.prodResultId);
          onDelete(prodResultIds); // 다중 삭제 함수 호출
        }
      });
    } else {
      Swal.fire({
        title: '알림',
        text: '삭제할 생산실적을 선택해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
    }
  }, [onDelete, selectedRowIds, productionResultList]);

  // 생산실적 목록 그리드 버튼: 독립형 생산실적 버튼 추가
  const productionResultButtons = useMemo(() => {
    const buttons = [];

    // "독립 생산실적" 버튼 (작업지시 없이 생성)
    buttons.push({
      label: '독립 생산실적',
      onClick: onCreateIndependentResult,
      icon: <NoteAddIcon/>,
      tooltip: '작업지시 없이 생산실적을 등록합니다',
      color: 'secondary'
    });

    // 일반 버튼들 추가
    buttons.push(
        {label: '등록', onClick: onCreateResult, icon: <AddIcon/>, tooltip: '선택된 작업지시에 생산실적을 등록합니다'},
        {label: '저장', onClick: onSave, icon: <SaveIcon/>},
        {label: '삭제', onClick: handleMultipleDelete, icon: <DeleteIcon/>}
    );

    return buttons;
  }, [onCreateResult, onCreateIndependentResult, onSave, handleMultipleDelete]);

  // 생산실적 목록 그리드 커스텀 헤더
  const CustomHeader = () => (
      <Stack direction="column" spacing={0.5} width="100%">
        <Typography variant="subtitle1" fontWeight="600">
          생산실적 목록 {selectedWorkOrder ? '- ' + selectedWorkOrder.workOrderId : ''}
        </Typography>
      </Stack>
  );

  // EnhancedDataGridWrapper에 전달할 추가 속성
  const gridProps = {
    editMode: "row", // 편집 모드를 row로 변경
    localeText: {
      // 한국어 날짜 형식 설정
      dateTimePickerToolbarTitle: '날짜 및 시간 선택',
      datePickerToolbarTitle: '날짜 선택',
      timePickerToolbarTitle: '시간 선택',
      datePickerDefaultToolbarTitle: '날짜 선택',
      timePickerDefaultToolbarTitle: '시간 선택',
    },
    // 셀 편집 가능 여부 판단 함수 추가
    isCellEditable: (params) => {
      // 이미 등록된 행(prodResultId가 있는 행)은 편집 불가
      if (params.row.prodResultId) {
        return false;
      }
      // 신규 등록 행(isNew가 true)은 편집 가능
      return params.row.isNew === true;
    },
    // 행 업데이트 처리
    processRowUpdate: (newRow, oldRow) => {
      try {
        // 현지 시간을 유지하면서 날짜를 문자열로 변환하는 함수
        const formatLocalDate = (date) => {
          if (!date) return null;
          const d = date instanceof Date ? date : new Date(date);
          if (isNaN(d.getTime())) return null;
          
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const seconds = String(d.getSeconds()).padStart(2, '0');
          
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        
        // 날짜 필드가 Date 객체인 경우 로컬 시간 문자열로 변환
        const updatedRow = {
          ...newRow,
          // Date 객체를 로컬 시간 문자열로 변환 (백엔드 저장을 위해)
          prodStartTime: newRow.prodStartTime instanceof Date ? 
                        formatLocalDate(newRow.prodStartTime) : 
                        newRow.prodStartTime,
          prodEndTime: newRow.prodEndTime instanceof Date ? 
                      formatLocalDate(newRow.prodEndTime) : 
                      newRow.prodEndTime
        };
        
        // 변경된 생산실적 데이터 업데이트
        const updatedList = productionResultList.map(row => 
          row.id === updatedRow.id ? updatedRow : row
        );
        setProductionResultList(updatedList);
        
        // 선택된 생산실적도 업데이트
        if (productionResult && productionResult.id === updatedRow.id) {
          setProductionResult(updatedRow);
        }
        
        return updatedRow;
      } catch (error) {
        console.error('행 업데이트 중 오류 발생:', error);
        return oldRow; // 오류 발생 시 원래 행 반환
      }
    }
  };

  return (
      <EnhancedDataGridWrapper
          title={<CustomHeader />}
          rows={productionResultList}
          columns={productionResultColumns}
          buttons={productionResultButtons}
          height={height}
          onRowClick={onRowClick}
          tabId={tabId + "-production-results"}
          gridProps={{
            ...gridProps,
            checkboxSelection: true,
            onRowSelectionModelChange: handleSelectionChange,
            onSelectionModelChange: handleSelectionChange,
            rowSelectionModel: selectedRowIds,
            selectionModel: selectedRowIds
          }}
      />
  );
};

export default ProductionResultList;
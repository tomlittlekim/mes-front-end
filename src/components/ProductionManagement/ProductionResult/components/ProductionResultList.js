import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Typography, Button, Stack, Select, MenuItem, TextField, Grid, Box } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Swal from 'sweetalert2';
import ProductMaterialSelector from '../editors/ProductMaterialSelector';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import { DataGrid } from '@mui/x-data-grid';

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
  onDefectInfoRegister,
  equipmentOptions,
  productOptions,
  warehouseOptions = [],
  setProductionResultList,
  setProductionResult,
  productionResult,
  tabId,
  height = 350,
  defectInfosMap
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
        if (!params || !params.value) return null;
        
        // 이미 Date 객체인 경우 그대로 반환
        if (params.value instanceof Date) {
          return params.value;
        }
        
        // 문자열이나 다른 형식을 Date 객체로 변환
        try {
          const dateValue = new Date(params.value);
          return isNaN(dateValue.getTime()) ? null : dateValue;
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
      },
      renderEditCell: (params) => {
        return (
             <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
               <DateTimePicker
                 value={params.value || null}
                 onChange={(newValue) => {
                   console.log('DateTimePicker onChange:', { field: params.field, newValue });
                   params.api.setEditCellValue({
                     id: params.id,
                     field: params.field,
                     value: newValue
                   });
                   // 선택 후 자동으로 편집 모드 종료
                   setTimeout(() => {
                     params.api.stopCellEditMode({
                       id: params.id,
                       field: params.field
                     });
                   }, 100);
                 }}
                 slotProps={{
                   textField: {
                     size: 'small',
                     fullWidth: true,
                     variant: 'outlined'
                   }
                 }}
               />
             </LocalizationProvider>
         );
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
        if (!params || !params.value) return null;
        
        // 이미 Date 객체인 경우 그대로 반환
        if (params.value instanceof Date) {
          return params.value;
        }
        
        // 문자열이나 다른 형식을 Date 객체로 변환
        try {
          const dateValue = new Date(params.value);
          return isNaN(dateValue.getTime()) ? null : dateValue;
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
      },
      renderEditCell: (params) => {
        return (
             <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
               <DateTimePicker
                 value={params.value || null}
                 onChange={(newValue) => {
                   console.log('DateTimePicker onChange:', { field: params.field, newValue });
                   params.api.setEditCellValue({
                     id: params.id,
                     field: params.field,
                     value: newValue
                   });
                   // 선택 후 자동으로 편집 모드 종료
                   setTimeout(() => {
                     params.api.stopCellEditMode({
                       id: params.id,
                       field: params.field
                     });
                   }, 100);
                 }}
                 slotProps={{
                   textField: {
                     size: 'small',
                     fullWidth: true,
                     variant: 'outlined'
                   }
                 }}
               />
             </LocalizationProvider>
         );
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
      headerName: '설비',
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
      },
      renderEditCell: (params) => {
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
                sx={{ 
                  minWidth: 150,
                  '& .MuiSelect-select': {
                    py: 0.5
                  }
                }}
            >
                <MenuItem value="">
                    <em>선택하세요</em>
                </MenuItem>
                {equipmentOptions.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                        <div>
                          {option.label}
                          {option.factoryName && option.lineName ? (
                              <div style={{ fontSize: '0.75em', color: 'gray' }}>
                                {option.factoryName} &gt; {option.lineName}
                              </div>
                          ) : null}
                        </div>
                    </MenuItem>
                ))}
            </Select>
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
    // 불량정보등록 버튼 컬럼
    {
      field: 'defectInfoAction',
      headerName: '불량정보',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const defectQty = Number(params.row.defectQty) || 0;
        
        // 불량수량이 0 이하면 버튼 표시하지 않음
        if (defectQty <= 0) {
          return null;
        }

        // 신규 행이 아니면 버튼 표시하지 않음 (등록된 행은 수정 불가)
        if (!params.row.isNew && params.row.prodResultId) {
          return (
            <Typography variant="caption" color="text.secondary">
              등록완료
            </Typography>
          );
        }

        // 불량정보가 등록되어 있는지 확인
        const hasDefectInfo = defectInfosMap && defectInfosMap[params.row.id] && 
                              defectInfosMap[params.row.id].length > 0;

        console.log('버튼 렌더링:', {
          rowId: params.row.id,
          defectQty,
          hasDefectInfo,
          defectInfosMap: defectInfosMap?.[params.row.id] || '없음'
        });

        return (
          <Button
            size="small"
            variant={hasDefectInfo ? "contained" : "outlined"}
            color={hasDefectInfo ? "success" : "warning"}
            onClick={(e) => {
              e.stopPropagation(); // 행 클릭 이벤트 방지
              if (onDefectInfoRegister) {
                onDefectInfoRegister(params.row);
              }
            }}
            sx={{
              minWidth: '80px',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            {hasDefectInfo ? '수정' : '등록'}
          </Button>
        );
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
      // 선택된 생산실적들을 임시 행과 저장된 행으로 분리
      const selectedResults = productionResultList.filter(result => 
        currentSelection.includes(result.id)
      );
      
      // 임시 행 (temp_ 로 시작하는 ID 또는 prodResultId가 없는 행)
      const tempRows = selectedResults.filter(result => 
        result.id.toString().startsWith('temp_') || !result.prodResultId
      );
      
      // 저장된 행 (prodResultId가 있는 행)
      const savedRows = selectedResults.filter(result => 
        result.prodResultId && !result.id.toString().startsWith('temp_')
      );
      
      // 임시 행이 있는 경우 바로 UI에서 제거
      if (tempRows.length > 0) {
        const tempRowIds = tempRows.map(row => row.id);
        const updatedList = productionResultList.filter(row => !tempRowIds.includes(row.id));
        setProductionResultList(updatedList);
        
        // 현재 선택된 생산실적이 삭제된 임시 행 중 하나라면 선택 해제
        if (productionResult && tempRowIds.includes(productionResult.id)) {
          setProductionResult(null);
        }
      }
      
      // 저장된 행이 있는 경우 서버 삭제 진행
      if (savedRows.length > 0) {
        // 다중 삭제 확인 다이얼로그
        Swal.fire({
          title: '생산실적 삭제',
          text: `선택된 ${savedRows.length}건의 생산실적을 삭제하시겠습니까?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: '삭제',
          cancelButtonText: '취소'
        }).then((result) => {
          if (result.isConfirmed) {
            // prodResultId 목록 추출
            const prodResultIds = savedRows.map(result => result.prodResultId);
            onDelete(prodResultIds); // 다중 삭제 함수 호출
          }
        });
      } else if (tempRows.length > 0) {
        // 임시 행만 삭제된 경우 완료 메시지 표시 (선택사항)
        // Swal.fire({
        //   title: '완료',
        //   text: `${tempRows.length}개의 임시 항목이 제거되었습니다.`,
        //   icon: 'success',
        //   confirmButtonText: '확인'
        // });
      }
    } else {
      Swal.fire({
        title: '알림',
        text: '삭제할 생산실적을 선택해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
    }
  }, [onDelete, selectedRowIds, productionResultList, setProductionResultList, productionResult, setProductionResult]);

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
        console.log('processRowUpdate 호출됨:', { newRow, oldRow });
        
        // 날짜 필드 처리 함수
        const proceseDateField = (fieldValue, oldFieldValue) => {
          // null이나 undefined인 경우 처리
          if (!fieldValue) {
            // 기존 값이 있으면 유지, 없으면 null
            return oldFieldValue || null;
          }
          
          // 이미 Date 객체인 경우 그대로 반환
          if (fieldValue instanceof Date) {
            return fieldValue;
          }
          
          // 문자열인 경우 Date 객체로 변환 시도
          try {
            const dateObj = new Date(fieldValue);
            return isNaN(dateObj.getTime()) ? (oldFieldValue || null) : dateObj;
          } catch (e) {
            console.error('날짜 변환 오류:', e);
            return oldFieldValue || null;
          }
        };
        
        // 날짜 필드를 안전하게 처리
        const updatedRow = {
          ...newRow,
          prodStartTime: proceseDateField(newRow.prodStartTime, oldRow.prodStartTime),
          prodEndTime: proceseDateField(newRow.prodEndTime, oldRow.prodEndTime)
        };
        
        console.log('업데이트된 행:', updatedRow);
        
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
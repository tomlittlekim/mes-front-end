import React, { useMemo } from 'react';
import { Typography, Button, Stack } from '@mui/material';
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
  onCreateIndependentResult, // 이제 이 함수는 모달을 여는 역할
  onSave,
  onDelete,
  equipmentOptions,
  productOptions,
  setProductionResultList,
  setProductionResult,
  productionResult,
  onRowEdit,
  tabId,
  height = 350
}) => {
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
    // 제품ID 필드 추가 (필수 입력 필드, ProductMaterialSelector 사용)
    {
      field: 'productId',
      headerName: '제품ID',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => (
          <ProductMaterialSelector {...params} productMaterials={productOptions} />
      ),
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
      description: '필수 입력 항목'
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
      editable: true,
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
      editable: true,
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
    // 생산시작일시 필드 수정
    {
      field: 'prodStartTime',
      headerName: '생산시작일시',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'dateTime',
      valueGetter: (params) => {
        // params가 null이거나 undefined인 경우 체크
        if (!params || params.value === undefined || params.value === null) return null;
        try {
          const date = new Date(params.value);
          return isNaN(date.getTime()) ? null : date;
        } catch (e) {
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
    // 생산종료일시 필드 수정
    {
      field: 'prodEndTime',
      headerName: '생산종료일시',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'dateTime',
      valueGetter: (params) => {
        // params가 null이거나 undefined인 경우 체크
        if (!params || params.value === undefined || params.value === null) return null;
        try {
          const date = new Date(params.value);
          return isNaN(date.getTime()) ? null : date;
        } catch (e) {
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
      width: 180,  // 너비 증가
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'singleSelect',
      valueOptions: equipmentOptions.map(option => option.value),
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
  ]), [equipmentOptions, productOptions]);

  // 생산실적 목록 그리드 버튼: 독립형 생산실적 버튼 추가
  const productionResultButtons = useMemo(() => {
    const buttons = [];

    // "독립 생산실적" 버튼 (작업지시 없이 생성)
    buttons.push({
      label: '독립 생산실적',
      onClick: onCreateIndependentResult, // 이제 이 함수는 모달을 여는 역할
      icon: <NoteAddIcon/>,
      tooltip: '작업지시 없이 생산실적을 등록합니다',
      color: 'secondary'
    });

    // 일반 버튼들 추가
    buttons.push(
        {label: '등록', onClick: onCreateResult, icon: <AddIcon/>, tooltip: '선택된 작업지시에 생산실적을 등록합니다'},
        {label: '저장', onClick: onSave, icon: <SaveIcon/>},
        {label: '삭제', onClick: onDelete, icon: <DeleteIcon/>}
    );

    return buttons;
  }, [onCreateResult, onCreateIndependentResult, onSave, onDelete]);

  // 생산실적 목록 그리드 커스텀 헤더
  const CustomHeader = () => (
      <Stack direction="column" spacing={0.5} width="100%">
        <Typography variant="subtitle1" fontWeight="600">
          생산실적 목록 {selectedWorkOrder ? '- ' + selectedWorkOrder.workOrderId : ''}
        </Typography>
      </Stack>
  );

  // 셀 값 변경 핸들러
  const handleCellEditCommit = (params) => {
    const { id, field, value } = params;

    // 변경된 행 찾기
    const rowToUpdate = productionResultList.find(row => row.id === id);

    if (!rowToUpdate) return;

    let updatedValue = value;

    // 숫자 필드는 Number 타입으로 변환
    if (field === 'goodQty' || field === 'defectQty') {
      updatedValue = Number(value);

      // 음수 값 방지
      if (updatedValue < 0) {
        Swal.fire({
          title: '입력 오류',
          text: '수량은 0 이상이어야 합니다.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        updatedValue = 0;
      }
    }

    // 제품ID 변경 시 필수 입력 확인
    if (field === 'productId' && !value) {
      Swal.fire({
        title: '입력 오류',
        text: '제품ID는 필수 입력 항목입니다.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    // 행 업데이트
    const updatedRow = { ...rowToUpdate, [field]: updatedValue };

    // 리스트 업데이트
    const updatedList = productionResultList.map(row =>
        row.id === id ? updatedRow : row
    );

    // 상태 업데이트
    setProductionResultList(updatedList);

    // 현재 수정한 행이 선택된 행이라면 productionResult도 업데이트
    if (productionResult && productionResult.id === id) {
      setProductionResult(updatedRow);
    }

    // onRowEdit 핸들러가 제공된 경우 호출
    if (onRowEdit) {
      onRowEdit(updatedRow);
    }
  };

  // EnhancedDataGridWrapper에 전달할 추가 속성
  const gridProps = {
    editMode: "cell",
    onCellEditCommit: handleCellEditCommit,
    // 내장 날짜 시간 편집기 설정
    localeText: {
      // 한국어 날짜 형식 설정
      dateTimePickerToolbarTitle: '날짜 및 시간 선택',
      datePickerToolbarTitle: '날짜 선택',
      timePickerToolbarTitle: '시간 선택',
      datePickerDefaultToolbarTitle: '날짜 선택',
      timePickerDefaultToolbarTitle: '시간 선택',
    },
    // 셀 편집 완료 후 처리를 위한 processRowUpdate 수정
    processRowUpdate: (newRow, oldRow) => {
      // 음수 값 방지
      if (newRow.goodQty < 0) {
        newRow.goodQty = 0;
      }

      if (newRow.defectQty < 0) {
        newRow.defectQty = 0;
      }

      // 날짜 필드가 Date 객체인 경우 적절하게 처리
      let processedRow = { ...newRow };

      // 생산시작일시 처리
      if (processedRow.prodStartTime instanceof Date) {
        console.log('Processing prodStartTime:', processedRow.prodStartTime);
        processedRow.prodStartTime = processedRow.prodStartTime.toISOString();
      } else if (processedRow.prodStartTime) {
        try {
          const date = new Date(processedRow.prodStartTime);
          if (!isNaN(date.getTime())) {
            console.log('Converting prodStartTime string to Date:', date);
            processedRow.prodStartTime = date.toISOString();
          }
        } catch (e) {
          console.error('Error processing prodStartTime:', e);
        }
      }

      // 생산종료일시 처리
      if (processedRow.prodEndTime instanceof Date) {
        console.log('Processing prodEndTime:', processedRow.prodEndTime);
        processedRow.prodEndTime = processedRow.prodEndTime.toISOString();
      } else if (processedRow.prodEndTime) {
        try {
          const date = new Date(processedRow.prodEndTime);
          if (!isNaN(date.getTime())) {
            console.log('Converting prodEndTime string to Date:', date);
            processedRow.prodEndTime = date.toISOString();
          }
        } catch (e) {
          console.error('Error processing prodEndTime:', e);
        }
      }

      // 처리된 행 출력 (디버깅용)
      console.log('Processed row:', processedRow);

      // 수정된 행 정보로 productionResultList 업데이트
      const updatedList = productionResultList.map(row =>
          row.id === processedRow.id ? processedRow : row
      );

      // 상태 업데이트
      setProductionResultList(updatedList);

      // 현재 수정한 행이 선택된 행이라면 productionResult도 업데이트
      if (productionResult && productionResult.id === processedRow.id) {
        setProductionResult(processedRow);

        // onRowEdit 핸들러가 제공된 경우 호출
        if (onRowEdit) {
          onRowEdit(processedRow);
        }
      }

      return processedRow;
    },
    // 에러 처리
    onProcessRowUpdateError: (error) => {
      console.error('데이터 업데이트 오류:', error);
      Swal.fire({
        title: '오류',
        text: '데이터 업데이트 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
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
          gridProps={gridProps}
      />
  );
};

export default ProductionResultList;
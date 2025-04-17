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
  onCreateIndependentResult, // 작업지시 없는 생산실적 생성 함수 추가
  onSave,
  onDelete,
  equipmentOptions,
  productOptions, // 제품 옵션 목록 추가
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
      onClick: onCreateIndependentResult,
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
    // 셀 편집 완료 후 처리를 위한 processRowUpdate 추가
    processRowUpdate: (newRow, oldRow) => {
      // 음수 값 방지
      if (newRow.goodQty < 0) {
        newRow.goodQty = 0;
      }

      if (newRow.defectQty < 0) {
        newRow.defectQty = 0;
      }

      // 수정된 행 정보로 productionResultList 업데이트
      const updatedList = productionResultList.map(row =>
          row.id === newRow.id ? newRow : row
      );
      setProductionResultList(updatedList);

      // 현재 수정한 행이 선택된 행이라면 productionResult도 업데이트
      if (productionResult && productionResult.id === newRow.id) {
        setProductionResult(newRow);

        // onRowEdit 핸들러가 제공된 경우 호출
        if (onRowEdit) {
          onRowEdit(newRow);
        }
      }

      return newRow;
    },
    // 에러 처리
    onProcessRowUpdateError: (error) => {
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
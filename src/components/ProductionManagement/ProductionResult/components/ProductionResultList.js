import React, {useMemo} from 'react';
import {Typography} from '@mui/material';
import {format} from 'date-fns';
import {EnhancedDataGridWrapper} from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

/**
 * 생산실적 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.productionResultList - 생산실적 목록 데이터
 * @param {Object} props.selectedWorkOrder - 선택된 작업지시 객체
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onCreateResult - 생산실적 생성 핸들러
 * @param {Function} props.onSave - 저장 핸들러
 * @param {Function} props.onDelete - 삭제 핸들러
 * @param {Array} props.equipmentOptions - 설비 옵션 목록
 * @param {Function} props.setProductionResultList - 생산실적 목록 업데이트 함수
 * @param {Function} props.setProductionResult - 선택된 생산실적 업데이트 함수
 * @param {Function} props.onRowEdit - 행 편집 이벤트 핸들러 (선택 사항)
 * @param {String} props.tabId - 탭 ID
 * @returns {JSX.Element}
 */
const ProductionResultList = ({
  productionResultList,
  selectedWorkOrder,
  onRowClick,
  onCreateResult,
  onSave,
  onDelete,
  equipmentOptions,
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
      width: 150,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'singleSelect',
      valueOptions: equipmentOptions.map(option => option.value),
      renderCell: (params) => {
        const equipment = equipmentOptions.find(e => e.value === params.value);
        return (
            <Typography variant="body2">
              {equipment ? equipment.label : params.value || ''}
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
  ]), [equipmentOptions]);

  // 생산실적 목록 그리드 버튼
  const productionResultButtons = useMemo(() => ([
    {label: '등록', onClick: onCreateResult, icon: <AddIcon/>},
    {label: '저장', onClick: onSave, icon: <SaveIcon/>},
    {label: '삭제', onClick: onDelete, icon: <DeleteIcon/>}
  ]), [onCreateResult, onSave, onDelete]);

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
      console.log("processRowUpdate 호출됨:", { newRow, oldRow });

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
        console.log("선택된 행 업데이트:", newRow);
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
      console.error("행 업데이트 오류:", error);
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
          title={`생산실적 목록 ${selectedWorkOrder ? '- '
              + selectedWorkOrder.workOrderId : ''}`}
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
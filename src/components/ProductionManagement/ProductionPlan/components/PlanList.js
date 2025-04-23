import React, { useMemo, useState } from 'react';
import { Typography, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ShiftTypeChip from './ShiftTypeChip';
import ProductMaterialSelector from '../editors/ProductMaterialSelector';
import OrderInfoModal from './OrderInfoModal';

/**
 * 생산계획 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.planList - 생산계획 목록 데이터
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onAdd - 등록 버튼 클릭 핸들러
 * @param {Function} props.onSave - 저장 버튼 클릭 핸들러
 * @param {Function} props.onDelete - 삭제 버튼 클릭 핸들러
 * @param {Number} props.refreshKey - 새로고침 키
 * @param {String} props.tabId - 탭 ID
 * @param {Object} props.gridProps - 그리드 추가 속성
 * @param {Array} props.productMaterials - 제품 정보 목록
 * @param {Object} props.vendorMap - 고객사ID를 고객사 정보로 매핑하는 객체
 * @returns {JSX.Element}
 */
const PlanList = ({
  planList,
  onRowClick,
  onAdd,
  onSave,
  onDelete,
  refreshKey,
  tabId,
  gridProps,
  productMaterials,
  vendorMap = {}
}) => {
  // 주문정보 모달 상태 관리
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState({
    orderId: '',
    orderDetailId: '',
    rowId: null
  });

  // MaterialType 코드값을 한글 표시값으로 변환하는 맵 정의
  const materialTypeMap = useMemo(() => ({
    'COMPLETE_PRODUCT': '완제품',
    'HALF_PRODUCT': '반제품',
    'RAW_MATERIAL': '원자재',
    'SUB_MATERIAL': '부자재'
  }), []);

  // 주문정보 모달 열기 핸들러
  const handleOpenOrderModal = (orderId, orderDetailId, rowId) => {
    setSelectedOrderInfo({
      orderId: orderId || '',
      orderDetailId: orderDetailId || '',
      rowId
    });
    setIsOrderModalOpen(true);
  };

  // 주문정보 모달 닫기 핸들러
  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  // 주문정보 저장 핸들러
  const handleConfirmOrderInfo = (orderId, orderDetailId, systemMaterialId, materialName, materialStandard, unit, quantity) => {
    // processRowUpdate 함수를 활용하여 선택된 행의 주문정보 업데이트
    if (selectedOrderInfo.rowId !== null && typeof gridProps.processRowUpdate === 'function') {
      const targetRow = planList.find(row => row.id === selectedOrderInfo.rowId);
      if (targetRow) {
        const updatedRow = { 
          ...targetRow, 
          orderId: orderId,                // 주문번호
          orderDetailId: orderDetailId,    // 주문상세ID
          productId: systemMaterialId,     // 제품ID (systemMaterialId)
          productName: materialName,       // 제품명
          // 제품유형은 ProductMaterialSelector가 자동으로 처리하므로 여기서는 설정하지 않음
          materialUnit: unit,              // 단위
          planQty: quantity                // 계획수량 = 주문수량
        };
        
        gridProps.processRowUpdate(updatedRow, targetRow);
      }
    }
  };

  // 셀 더블클릭 핸들러
  const handleCellDoubleClick = (params) => {
    // 주문번호 또는 주문상세ID 필드만 처리
    if (params.field === 'orderId' || params.field === 'orderDetailId') {
      handleOpenOrderModal(
        params.row.orderId,
        params.row.orderDetailId,
        params.row.id
      );
    }
  };

  // 생산계획 목록 그리드 컬럼 정의
  const planColumns = useMemo(() => ([
    {
      field: 'prodPlanId',
      headerName: '생산계획ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'orderId',
      headerName: '주문번호',
      width: 150,
      editable: false, // 직접 수정 불가 (모달을 통해서만 수정)
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'orderDetailId',
      headerName: '주문상세ID',
      width: 150,
      editable: false, // 직접 수정 불가 (모달을 통해서만 수정)
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID*',
      width: 150,
      editable: true,
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

        if (showRequired) {
          return (
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                필수 입력
              </Typography>
          );
        }

        // productId 값이 있으면 해당 제품의 userMaterialId 찾아서 표시
        if (params.value) {
          const product = productMaterials.find(p => p.systemMaterialId === params.value);
          if (product) {
            return (
                <Tooltip
                    title={`${materialTypeMap[product.materialType] || product.materialType || '기타'} > ${product.materialCategory || '일반'}`}
                    arrow
                >
                  <Typography variant="body2">
                    {product.userMaterialId || params.value}
                  </Typography>
                </Tooltip>
            );
          }
        }

        // 기본값 표시 (productId 값 자체)
        return (
            <Typography variant="body2">
              {params.value || ''}
            </Typography>
        );
      }
    },
    {
      field: 'productName',
      headerName: '제품명',
      width: 180,
      editable: true,
      headerAlign: 'center',
      align: 'left',
      renderEditCell: (params) => (
          <ProductMaterialSelector {...params} productMaterials={productMaterials} />
      ),
      renderCell: (params) => {
        // 제품 정보 가져오기
        let product = null;
        if (params.row.productId) {
          product = productMaterials.find(p => p.systemMaterialId === params.row.productId);
        }

        // params.value가 있으면 그대로 표시하고, 툴팁에 추가 정보 제공
        if (params.value) {
          // 제품 정보가 있으면 툴팁에 규격 및 유형 정보 추가
          if (product) {
            const materialTypeText = materialTypeMap[product.materialType] || product.materialType || '기타';
            const tooltipText = product.materialStandard
                ? `${materialTypeText} | 규격: ${product.materialStandard}`
                : materialTypeText;

            return (
                <Tooltip title={tooltipText} arrow>
                  <Typography variant="body2" noWrap>{params.value}</Typography>
                </Tooltip>
            );
          }

          return <Typography variant="body2" noWrap>{params.value}</Typography>;
        }

        // params.value가 없지만 productId가 있는 경우, productId로 제품명 조회
        if (product && product.materialName) {
          const materialTypeText = materialTypeMap[product.materialType] || product.materialType || '기타';
          const tooltipText = product.materialStandard
              ? `${materialTypeText} | 규격: ${product.materialStandard}`
              : materialTypeText;

          return (
              <Tooltip title={tooltipText} arrow>
                <Typography variant="body2" noWrap>{product.materialName}</Typography>
              </Tooltip>
          );
        }

        // 둘 다 없는 경우 빈 문자열 표시
        return <Typography variant="body2"></Typography>;
      }
    },
    {
      field: 'materialCategory',
      headerName: '제품유형',
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 제품 정보 가져오기
        let product = null;
        let categoryText = '';
        
        if (params.row.productId) {
          product = productMaterials.find(p => p.systemMaterialId === params.row.productId);
          if (product) {
            categoryText = product.materialCategory || '';
          }
        }
        
        return (
          <Typography variant="body2">
            {categoryText}
          </Typography>
        );
      }
    },
    {
      field: 'materialUnit',
      headerName: '단위',
      width: 100,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 제품 정보에서 단위 가져오기
        let unitText = '';
        
        if (params.row.productId) {
          const product = productMaterials.find(p => p.systemMaterialId === params.row.productId);
          if (product) {
            unitText = product.materialUnit || '';
          }
        }
        
        return (
          <Typography variant="body2">
            {unitText}
          </Typography>
        );
      }
    },
    {
      field: 'planQty',
      headerName: '계획수량',
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
      headerName: '주/야간',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: [
        { value: 'DAY', label: '주간' },
        { value: 'NIGHT', label: '야간' },
      ],
      renderCell: (params) => {
        return <ShiftTypeChip type={params.value || 'DAY'} />;
      }
    },
    {
      field: 'planStartDate',
      headerName: '계획시작일시',
      width: 180,
      editable: true,
      type: 'date',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          } catch (e) {
            displayValue = '';
          }
        }

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'planEndDate',
      headerName: '계획종료일시',
      width: 180,
      editable: true,
      type: 'date',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          } catch (e) {
            displayValue = '';
          }
        }

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      editable: false,
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
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'updateDate',
      headerName: '수정일',
      width: 120,
      editable: false,
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
  ]), [productMaterials, materialTypeMap]);

  // 생산계획 목록 그리드 버튼
  const planGridButtons = useMemo(() => ([
    { label: '등록', onClick: onAdd, icon: <AddIcon /> },
    { label: '저장', onClick: onSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: onDelete, icon: <DeleteIcon /> }
  ]), [onAdd, onSave, onDelete]);

  return (
    <>
      <EnhancedDataGridWrapper
        title="생산계획목록"
        key={refreshKey}
        rows={planList}
        columns={planColumns}
        buttons={planGridButtons}
        height={450}
        onRowClick={onRowClick}
        tabId={tabId + "-production-plans"}
        gridProps={{
          ...gridProps,
          onCellDoubleClick: handleCellDoubleClick
        }}
      />
      
      {/* 주문정보 모달 */}
      <OrderInfoModal
        open={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        orderId={selectedOrderInfo.orderId}
        orderDetailId={selectedOrderInfo.orderDetailId}
        onConfirm={handleConfirmOrderInfo}
        vendorMap={vendorMap}
      />
    </>
  );
};

export default PlanList;
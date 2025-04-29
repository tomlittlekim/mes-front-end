import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

/**
 * 생산실적 목록 그리드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.productionResultList - 생산실적 목록 데이터
 * @param {Function} props.onPrint - 출력 버튼 클릭 핸들러
 * @param {Function} props.onExport - 엑셀 내보내기 버튼 클릭 핸들러
 * @param {string} props.tabId - 탭 ID
 * @param {Number} props.height - 그리드 높이
 * @param {Array} props.productOptions - 제품 옵션 목록 - 추가
 * @param {Array} props.equipmentOptions - 설비 옵션 목록 - 추가
 * @returns {JSX.Element}
 */
const ProductionResultList = ({
  productionResultList,
  onPrint,
  onExport,
  tabId,
  height = 350,
  productOptions = [], // 제품 옵션 목록 추가
  equipmentOptions = [] // 설비 옵션 목록 추가
}) => {
  // 날짜 포맷 함수
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return !isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '-';
    } catch (e) {
      return '-';
    }
  };

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
            {params.value || ''}
          </Typography>
      )
    },
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value || '-'}
          </Typography>
      )
    },
    {
      field: 'productId',
      headerName: '제품ID',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // systemMaterialId를 기준으로 제품 찾기
        const product = productOptions.find(p => p.systemMaterialId === params.value);
        
        // 제품을 찾았으면 userMaterialId 표시
        if (product) {
          return (
              <Typography variant="body2">
                {product.userMaterialId || params.value}
              </Typography>
          );
        }
        
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
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // params.row.productId(systemMaterialId)를 이용해 제품 찾기
        const product = productOptions.find(p => p.systemMaterialId === params.row.productId);
        
        // 제품을 찾았으면 materialName 표시
        if (product) {
          return (
              <Typography variant="body2">
                {product.materialName || '-'}
              </Typography>
          );
        }
        
        return (
            <Typography variant="body2">
                -
            </Typography>
        );
      }
    },
    {
      field: 'unit',
      headerName: '단위',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // params.row.productId(systemMaterialId)를 이용해 제품 찾기
        const product = productOptions.find(p => p.systemMaterialId === params.row.productId);
        
        // 제품을 찾았으면 unit 표시
        if (product) {
          return (
              <Typography variant="body2">
                {product.unit || '-'}
              </Typography>
          );
        }
        
        return (
            <Typography variant="body2">
                -
            </Typography>
        );
      }
    },
    {
      field: 'totalQty',
      headerName: '생산수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const goodQty = params.row.goodQty || 0;
        const defectQty = params.row.defectQty || 0;
        const totalQty = goodQty + defectQty;
        
        return (
          <Typography variant="body2">
            {totalQty.toLocaleString()}
          </Typography>
        );
      }
    },
    {
      field: 'goodQty',
      headerName: '양품수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
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
      renderCell: (params) => {
        // 작업지시ID가 없는 경우 진척률을 '-'로 표시
        if (!params.row.workOrderId) {
          return (
            <Typography variant="body2">-</Typography>
          );
        }
        
        return (
          <Typography variant="body2">
            {params.value !== null && params.value !== undefined
                ? `${params.value}%`
                : '0%'}
          </Typography>
        );
      }
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
                : '0%'}
          </Typography>
      )
    },
    {
      field: 'equipmentId',
      headerName: '설비',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 설비ID가 없는 경우 '-'로 표시
        if (!params.value) {
          return (
            <Typography variant="body2">-</Typography>
          );
        }
        
        // equipmentId를 기준으로 설비 찾기
        const equipment = equipmentOptions.find(e => e.equipmentId === params.value);
        
        // 설비를 찾았으면 equipmentName 표시
        if (equipment) {
          return (
              <Typography variant="body2">
                {equipment.equipmentName || params.value}
              </Typography>
          );
        }
        
        return (
            <Typography variant="body2">
                {params.value || '-'}
            </Typography>
        );
      }
    },
    {
      field: 'prodStartTime',
      headerName: '생산시작일시',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {formatDateDisplay(params.value)}
          </Typography>
      )
    },
    {
      field: 'prodEndTime',
      headerName: '생산종료일시',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {formatDateDisplay(params.value)}
          </Typography>
      )
    },
    {
      field: 'createDate',
      headerName: '등록일시',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {formatDateDisplay(params.value)}
          </Typography>
      )
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    }
  ]), [productOptions, equipmentOptions]); // 의존성 배열에 equipmentOptions 추가

  // 생산실적 목록 그리드 버튼 (출력 및 엑셀 내보내기)
  const productionResultButtons = useMemo(() => ([
    { label: '출력', onClick: onPrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: onExport, icon: <FileDownloadIcon /> }
  ]), [onPrint, onExport]);

  return (
      <EnhancedDataGridWrapper
          title="생산실적 목록"
          rows={productionResultList}
          columns={productionResultColumns}
          buttons={productionResultButtons}
          height={height}
          tabId={tabId + "-production-results"}
          gridProps={{
            initialState: {
              sorting: {
                sortModel: [{ field: 'prodResultId', sort: 'desc' }]
              }
            }
          }}
      />
  );
};

export default ProductionResultList;
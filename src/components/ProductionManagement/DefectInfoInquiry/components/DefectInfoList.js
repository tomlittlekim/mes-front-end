import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper, FieldSelectionModal } from '../../../Common';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { transformDataForExport, exportToExcel, executePrint } from '../../../../utils/exportUtils';

/**
 * 불량정보 목록 그리드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.defectInfoList - 불량정보 목록 데이터
 * @param {Function} props.onPrint - 출력 버튼 클릭 핸들러
 * @param {Function} props.onExport - 엑셀 내보내기 버튼 클릭 핸들러
 * @param {string} props.tabId - 탭 ID
 * @param {Number} props.height - 그리드 높이
 * @param {Array} props.productOptions - 제품 옵션 목록 - 추가
 * @param {Array} props.equipmentOptions - 설비 옵션 목록 - 추가
 * @returns {JSX.Element}
 */
const DefectInfoList = ({
  defectInfoList,
  onPrint,
  onExport,
  tabId,
  height = 350,
  productOptions = [],
  equipmentOptions = []
}) => {
  // 필드 선택 모달 상태
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [exportType, setExportType] = useState(''); // 'print' | 'excel'

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

  // 불량정보 그리드 컬럼 정의
  const defectInfoColumns = useMemo(() => ([
    {
      field: 'defectId',
      headerName: '불량ID',
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
      field: 'prodResultId',
      headerName: '생산실적ID',
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
                {product.materialName || params.value || '-'}
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
      field: 'defectQty',
      headerName: '불량수량',
      width: 130,
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
      field: 'defectCause',
      headerName: '불량종류',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.row.defectCauseName || '-'}
          </Typography>
      )
    },
    {
      field: 'resultInfo',
      headerName: '불량정보',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value || '-'}
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
      field: 'createDate',
      headerName: '등록일시',
      width: 170,
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
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value || '-'}
          </Typography>
      )
    }
  ]), [productOptions, equipmentOptions]);

  // 모달 선택용 컬럼 정의 (모든 컬럼 포함)
  const allAvailableColumns = useMemo(() => ([
    ...defectInfoColumns,
    {
      field: 'createUserName',
      headerName: '등록자명',
      width: 130,
      headerAlign: 'center',
      align: 'center'
    }
  ]), [defectInfoColumns]);

  // 출력 버튼 클릭 핸들러
  const handlePrintClick = () => {
    setExportType('print');
    setIsFieldModalOpen(true);
  };

  // 엑셀 버튼 클릭 핸들러
  const handleExcelClick = () => {
    setExportType('excel');
    setIsFieldModalOpen(true);
  };

  // 필드 선택 모달 확인 핸들러
  const handleFieldSelectionConfirm = ({ selectedFields, userFieldType }) => {
    try {
      // 데이터 변환
      const transformedData = transformDataForExport(
        defectInfoList,
        allAvailableColumns,
        selectedFields,
        userFieldType,
        productOptions,
        equipmentOptions
      );

      if (exportType === 'print') {
        // 출력 실행
        executePrint(transformedData, '불량정보 조회');
      } else if (exportType === 'excel') {
        // 엑셀 내보내기 실행
        exportToExcel(transformedData, '불량정보조회', '불량정보');
      }
    } catch (error) {
      console.error('내보내기 오류:', error);
    } finally {
      setIsFieldModalOpen(false);
      setExportType('');
    }
  };

  // 필드 선택 모달 취소 핸들러
  const handleFieldSelectionClose = () => {
    setIsFieldModalOpen(false);
    setExportType('');
  };

  // 불량정보 목록 그리드 버튼 (출력 및 엑셀 내보내기)
  const defectInfoButtons = useMemo(() => ([
    { label: '출력', onClick: handlePrintClick, icon: <PrintIcon /> },
    { label: '엑셀', onClick: handleExcelClick, icon: <FileDownloadIcon /> }
  ]), []);

  return (
    <>
      <EnhancedDataGridWrapper
          title="불량정보 목록"
          rows={defectInfoList}
          columns={defectInfoColumns}
          buttons={defectInfoButtons}
          height={height}
          tabId={tabId + "-defect-info"}
          gridProps={{
            initialState: {
              sorting: {
                sortModel: [{ field: 'createDate', sort: 'desc' }]
              }
            }
          }}
      />

      {/* 필드 선택 모달 */}
      <FieldSelectionModal
        open={isFieldModalOpen}
        onClose={handleFieldSelectionClose}
        title={exportType === 'print' ? '출력 필드 선택' : '엑셀 내보내기 필드 선택'}
        fields={allAvailableColumns}
        onConfirm={handleFieldSelectionConfirm}
        defaultSelectedFields={[
          'defectId',
          'prodResultId',
          'productId',
          'productName',
          'defectQty',
          'defectCause',
          'resultInfo',
          'equipmentId',
          'createDate'
        ]}
        defaultUserFieldType="id"
      />
    </>
  );
};

export default DefectInfoList; 
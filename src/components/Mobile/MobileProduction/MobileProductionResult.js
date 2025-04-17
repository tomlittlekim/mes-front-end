import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import { useGraphQL } from "../../../apollo/useGraphQL";
import { useGridUtils } from "../../../utils/grid/useGridUtils";
import { format } from "date-fns";
import Message from "../../../utils/message/Message";

import {
  PRODUCTION_GET,
  PRODUCTION_SAVE,
  PRODUCTION_DELETE,
  PRODUCT_GET,
  EQUIPMENT_GET,
  WORK_ORDER_GET
} from './ProductionResultGraphQL';

import {
  SEARCH_CONDITIONS,
  EMPTY_PRODUCTION_FORM,
  getProductionStatus
} from './ProductionResultConstants';

import ProductionResultList from './ProductionResultList';
import ProductionResultFilterDialog from './ProductionResultFilterDialog';
import ProductionResultEditDialog from './ProductionResultEditDialog';
import ProductionResultDefectDialog from './ProductionResultDefectDialog';

const MobileProductionResult = () => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery, executeMutation } = useGraphQL();
  const { generateId, formatDateToYYYYMMDD } = useGridUtils();
  const [isAddMode, setIsAddMode] = useState(false);

  // 스타일 관련 함수
  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#1976d2' : '#0a2351';
  };

  const handleDelete = async (prodResultId) => {
    if (!prodResultId) {
      setSnackbar({
        open: true,
        message: '삭제할 생산실적을 선택해주세요.',
        severity: 'warning'
      });
      return;
    }

    const confirmed = window.confirm('선택한 생산실적을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setLoading(true);

      const { data } = await executeMutation({
        mutation: PRODUCTION_DELETE,
        variables: {
          prodResultId
        }
      });

      if (data && data.deleteProductionResult) {
        setSnackbar({
          open: true,
          message: '생산실적이 삭제되었습니다.',
          severity: 'success'
        });
        handleSearch(); // 목록 새로고침
      }
    } catch (error) {
      console.error('생산실적 삭제 중 에러 발생:', error);
      setSnackbar({
        open: true,
        message: '생산실적 삭제 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 제품, 설비, 작업지시 목록 조회
  const loadData = async () => {
    try {
      setLoading(true);

      // 제품 목록 조회
      const productResult = await executeQuery({
        query: PRODUCT_GET
      });

      if (productResult.data && productResult.data.getCompleteMaterials) {
        setProductList(productResult.data.getCompleteMaterials.map(product => ({
          id: product.systemMaterialId,
          name: product.materialName,
          code: product.userMaterialId
        })));
      }

      // 설비 목록 조회
      const equipmentResult = await executeQuery({
        query: EQUIPMENT_GET
      });

      if (equipmentResult.data && equipmentResult.data.getEquipments) {
        setEquipmentList(equipmentResult.data.getEquipments.map(equipment => ({
          id: equipment.equipmentId,
          name: equipment.equipmentName
        })));
      }

      // 작업지시 목록 조회
      const workOrderResult = await executeQuery({
        query: WORK_ORDER_GET,
        variables: {
          filter: {
            state: ['PLANNED', 'IN_PROGRESS'],
            flagActive: true
          }
        }
      });

      if (workOrderResult.data && workOrderResult.data.getWorkOrders) {
        setWorkOrderList(workOrderResult.data.getWorkOrders.map(order => ({
          id: order.workOrderId,
          productId: order.productId,
          productName: order.productName,
          orderQty: order.orderQty,
          state: order.state
        })));
      }

      // 생산실적 목록 조회
      await handleSearch();
    } catch (error) {
      console.error('데이터 로드 중 에러 발생:', error);
      setSnackbar({
        open: true,
        message: '데이터 로드 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#3d2814' : '#f5e8d7') :
      (isDarkMode ? '#1e3a5f' : '#e0e0e0');

  // 상태 관리
  const [productionList, setProductionList] = useState([]);
  const [productList, setProductList] = useState([]); // 제품 목록
  const [equipmentList, setEquipmentList] = useState([]); // 설비 목록
  const [workOrderList, setWorkOrderList] = useState([]); // 작업지시 목록
  const [searchParams, setSearchParams] = useState(SEARCH_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDefectInfoModalOpen, setIsDefectInfoModalOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [defectInfos, setDefectInfos] = useState([]);
  const [editMode, setEditMode] = useState(false); // false = 신규, true = 수정
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 데이터 포맷팅 함수
  const formatProductionData = (data) => {
    if (!data || !data.productionResultList) return [];

    return data.productionResultList.map(result => ({
      ...result,
      id: result.id || generateId('TEMP')
    }));
  };

  // 신규 생산실적 생성 구조
  const createNewProduction = () => ({
    id: generateId('NEW'),
    prodResultId: '',
    workOrderId: '',
    equipmentId: '',
    equipmentName: '',
    productId: '',
    productName: '',
    prodDate: formatDateToYYYYMMDD(new Date()),
    goodQty: 0,
    defectQty: 0,
    progressRate: 0,
    defectRate: 0,
    shiftType: 'DAY',
    workers: '',
    memo: '',
    createUser: '자동입력',
    createDate: formatDateToYYYYMMDD(new Date()),
    updateUser: '자동입력',
    updateDate: formatDateToYYYYMMDD(new Date())
  });

  // 검색 조건 포맷팅
  const formatSearchParams = (data) => ({
    ...data,
    fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
    toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
  });

  // 생산실적 데이터 포맷팅 (저장용)
  const transformRowForCreation = (row) => ({
    workOrderId: row.workOrderId || null, // 작업지시 없이도 가능하도록 null 허용
    goodQty: Number(row.goodQty) || 0,
    defectQty: Number(row.defectQty) || 0,
    equipmentId: row.equipmentId || '',
    resultInfo: row.memo || '',
    defectCause: '',
    flagActive: true
  });

  const transformRowForUpdate = (row) => ({
    prodResultId: row.prodResultId,
    workOrderId: row.workOrderId || null, // 작업지시 없이도 가능하도록 null 허용
    goodQty: Number(row.goodQty) || 0,
    defectQty: Number(row.defectQty) || 0,
    equipmentId: row.equipmentId || '',
    resultInfo: row.memo || '',
    defectCause: '',
    flagActive: true
  });

  // 불량정보 변환
  const transformDefectInfos = (defectInfos, prodResultId) => {
    return defectInfos.map(info => ({
      prodResultId,
      defectQty: Number(info.defectQty) || 0,
      defectType: info.defectType || '',
      defectCause: info.defectCause || '',
      resultInfo: info.resultInfo || '',
      flagActive: true
    }));
  };

  // API 호출 함수들
  const handleSearch = async (params = searchParams) => {
    try {
      setLoading(true);
      const formattedParams = formatSearchParams(params);

      const { data } = await executeQuery({
        query: PRODUCTION_GET,
        variables: {
          filter: {
            equipmentId: formattedParams.equipmentId,
            productId: formattedParams.productId,
            fromDate: formattedParams.fromDate,
            toDate: formattedParams.toDate,
            flagActive: true
          }
        }
      });

      const formattedData = formatProductionData(data);
      setProductionList(formattedData);
    } catch (error) {
      console.error('생산실적 조회 중 에러 발생:', error);
      setSnackbar({
        open: true,
        message: '생산실적 조회 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProduction) return;

    // 필수값 체크
    if (!selectedProduction.equipmentId || !selectedProduction.productId || !selectedProduction.prodDate) {
      setSnackbar({
        open: true,
        message: '설비, 제품, 생산일자는 필수 입력 항목입니다.',
        severity: 'warning'
      });
      return;
    }

    // 불량수량이 있는 경우 불량정보가 필요
    if (selectedProduction.defectQty > 0 && !isDefectInfoValid()) {
      setIsDefectInfoModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      let createdRows = null;
      let updatedRows = null;

      if (editMode) {
        // 수정 모드
        updatedRows = [transformRowForUpdate(selectedProduction)];
      } else {
        // 생성 모드
        createdRows = [transformRowForCreation(selectedProduction)];
      }

      // 불량정보 준비
      const defectInfosToSave = selectedProduction.defectQty > 0 ?
          transformDefectInfos(defectInfos, selectedProduction.prodResultId) :
          [];

      const { data } = await executeMutation({
        mutation: PRODUCTION_SAVE,
        variables: {
          createdRows,
          updatedRows,
          defectInfos: defectInfosToSave
        }
      });

      if (data && data.saveProductionResult) {
        setSnackbar({
          open: true,
          message: editMode ? '생산실적 정보가 수정되었습니다.' : '새 생산실적이 등록되었습니다.',
          severity: 'success'
        });
        handleSearch(); // 목록 새로고침
        setIsEditDialogOpen(false);
        setDefectInfos([]);
      }
    } catch (error) {
      console.error('생산실적 저장 중 에러 발생:', error);

      // 서버 오류 메시지 처리
      let errorMessage = '생산실적 저장 중 오류가 발생했습니다.';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const serverMessage = error.graphQLErrors[0].message;
        if (serverMessage) {
          errorMessage = serverMessage;
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 불량정보 유효성 체크
  const isDefectInfoValid = () => {
    if (!selectedProduction || selectedProduction.defectQty <= 0) return true;

    if (defectInfos.length === 0) return false;

    const totalDefectQty = defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);
    return Math.abs(totalDefectQty - selectedProduction.defectQty) < 0.001;
  };

  // 사용자 인터랙션 핸들러
  const handleAddNew = () => {
    setSelectedProduction(createNewProduction());
    setDefectInfos([]);
    setEditMode(false);
    setIsAddMode(true);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (production) => {
    setSelectedProduction(production);
    // 불량정보 초기화 (추후 불량정보 조회 API 연동 시 해당 생산실적의 불량정보 조회)
    setDefectInfos([]);
    setEditMode(true);
    setIsAddMode(false);
    setIsEditDialogOpen(true);
  };

  const handleOpenFilter = () => {
    setIsFilterDialogOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterDialogOpen(false);
  };

  const handleOpenDefectInfoModal = () => {
    setIsDefectInfoModalOpen(true);
  };

  const handleCloseDefectInfoModal = () => {
    setIsDefectInfoModalOpen(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleDateChange = (field, date) => {
    setSearchParams({
      ...searchParams,
      [field]: date
    });
  };

  const handleResetFilters = () => {
    setSearchParams(SEARCH_CONDITIONS);
  };

  const handleApplyFilters = () => {
    handleSearch();
    setIsFilterDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduction({
      ...selectedProduction,
      [name]: value
    });
  };

  const handleEquipmentChange = (e) => {
    const { value } = e.target;
    const selectedEquipment = equipmentList.find(equipment => equipment.id === value);

    setSelectedProduction({
      ...selectedProduction,
      equipmentId: value,
      equipmentName: selectedEquipment ? selectedEquipment.name : ''
    });
  };

  const handleProductChange = (e) => {
    const { value } = e.target;
    const selectedProduct = productList.find(product => product.id === value);

    setSelectedProduction({
      ...selectedProduction,
      productId: value,
      productName: selectedProduct ? selectedProduct.name : ''
    });
  };

  const handleWorkOrderChange = (e) => {
    const { value } = e.target;

    if (!value) {
      setSelectedProduction({
        ...selectedProduction,
        workOrderId: ''
      });
      return;
    }

    const selectedWorkOrder = workOrderList.find(order => order.id === value);

    if (selectedWorkOrder) {
      setSelectedProduction({
        ...selectedProduction,
        workOrderId: value,
        productId: selectedWorkOrder.productId,
        productName: selectedWorkOrder.productName
      });
    }
  };

  const handleProductionDateChange = (date) => {
    setSelectedProduction({
      ...selectedProduction,
      prodDate: date
    });
  };

  // 컴포넌트 초기화
  useEffect(() => {
    loadData();
  }, []);

  const renderHeader = () => (
    <Box sx={{ mb: 2, pt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
          생산실적
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton
              onClick={handleOpenFilter}
              sx={{ 
                color: getAccentColor(), 
                fontSize: '1.6rem', 
                padding: '10px',
                border: `1px solid ${getBorderColor()}`,
                borderRadius: '8px',
                minWidth: '48px',
                minHeight: '48px'
              }}
              size="large"
          >
            <FilterListIcon fontSize="inherit" />
          </IconButton>
          <IconButton
              onClick={handleAddNew}
              sx={{ 
                color: getAccentColor(), 
                fontSize: '1.6rem', 
                padding: '10px',
                border: `1px solid ${getBorderColor()}`,
                borderRadius: '8px',
                minWidth: '48px',
                minHeight: '48px'
              }}
              size="large"
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />
    </Box>
  );

  return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 영역 */}
        {renderHeader()}

        {/* 활성 필터 표시 영역 */}
        {(searchParams.equipmentId || searchParams.productId) && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchParams.equipmentId && (
                  <Chip
                      label={`설비: ${equipmentList.find(e => e.id === searchParams.equipmentId)?.name || searchParams.equipmentId}`}
                      onDelete={() => {
                        setSearchParams(prev => {
                          const updated = { ...prev, equipmentId: '' };
                          // 상태 업데이트 후 바로 검색 실행
                          setTimeout(() => handleSearch(updated), 0);
                          return updated;
                        });
                      }}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '0.9rem', height: '32px' }}
                  />
              )}
              {searchParams.productId && (
                  <Chip
                      label={`제품: ${productList.find(p => p.id === searchParams.productId)?.name || searchParams.productId}`}
                      onDelete={() => {
                        setSearchParams(prev => {
                          const updated = { ...prev, productId: '' };
                          // 상태 업데이트 후 바로 검색 실행
                          setTimeout(() => handleSearch(updated), 0);
                          return updated;
                        });
                      }}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '0.9rem', height: '32px' }}
                  />
              )}
              <Chip
                  label="필터 초기화"
                  onDelete={() => {
                    setSearchParams(SEARCH_CONDITIONS);
                    setTimeout(() => handleSearch(SEARCH_CONDITIONS), 0);
                  }}
                  onClick={() => {
                    setSearchParams(SEARCH_CONDITIONS);
                    setTimeout(() => handleSearch(SEARCH_CONDITIONS), 0);
                  }}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.9rem', height: '32px' }}
              />
            </Box>
        )}

        {/* 생산실적 목록 컴포넌트 - 남은 공간을 모두 차지하도록 설정 */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <ProductionResultList
              productionList={productionList}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddNew={handleAddNew}
              getAccentColor={getAccentColor}
              getBorderColor={getBorderColor}
          />
        </Box>

        {/* 필터 다이얼로그 */}
        <ProductionResultFilterDialog
            open={isFilterDialogOpen}
            onClose={handleCloseFilter}
            searchParams={searchParams}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onApplyFilters={handleApplyFilters}
            getAccentColor={getAccentColor}
            productList={productList}
            equipmentList={equipmentList}
        />

        {/* 생산실적 추가/수정 다이얼로그 */}
        <ProductionResultEditDialog
            open={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setIsAddMode(false);
            }}
            production={selectedProduction}
            editMode={editMode}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onEquipmentChange={handleEquipmentChange}
            onProductChange={handleProductChange}
            onWorkOrderChange={handleWorkOrderChange}
            onDateChange={handleProductionDateChange}
            onOpenDefectInfo={handleOpenDefectInfoModal}
            getAccentColor={getAccentColor}
            equipmentList={equipmentList}
            productList={productList}
            workOrderList={workOrderList}
        />

        {/* 불량정보 다이얼로그 */}
        <ProductionResultDefectDialog
            open={isDefectInfoModalOpen}
            onClose={handleCloseDefectInfoModal}
            defectInfos={defectInfos}
            setDefectInfos={setDefectInfos}
            getAccentColor={getAccentColor}
        />

        {/* 스낵바 알림 */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ mb: 2 }}
        >
          <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%', fontSize: '1rem' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default MobileProductionResult;
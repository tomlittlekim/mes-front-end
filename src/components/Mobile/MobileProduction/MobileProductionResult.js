// MobileProductionResult.js (대체 파일)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Divider,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGraphQL } from "../../../apollo/useGraphQL";
import { useGridUtils } from "../../../utils/grid/useGridUtils";

import {
  PRODUCTION_RESULTS_MOBILE,
  PRODUCT_OPTIONS,
  EQUIPMENT_OPTIONS,
  SAVE_PRODUCTION_RESULT,
  DELETE_PRODUCTION_RESULT
} from './ProductionResultGraphQL';
import { SEARCH_CONDITIONS } from './ProductionResultConstants';
import ProductionResultList from './components/ProductionResultList';
import ProductionResultFilterDialog from './components/ProductionResultFilterDialog';
import ProductionResultEditDialog from './components/ProductionResultEditDialog';
import DefectInfoDialog from './components/DefectInfoDialog';

const MobileProductionResult = () => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery, executeMutation } = useGraphQL();
  const { generateId } = useGridUtils();

  // 스타일 관련 함수
  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#1976d2' : '#0a2351';
  };

  const getBorderColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#3d2814' : '#f5e8d7') :
      (isDarkMode ? '#1e3a5f' : '#e0e0e0');

  // 상태 관리
  const [productionResults, setProductionResults] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [searchParams, setSearchParams] = useState(SEARCH_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDefectInfoDialogOpen, setIsDefectInfoDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [defectInfos, setDefectInfos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 기본 데이터(제품, 설비) 먼저 로드
      await Promise.all([
        fetchProductOptions(),
        fetchEquipmentOptions()
      ]);
      
      // 생산실적 데이터 로드
      await handleSearch();
      
      console.log('모든 초기 데이터 로드 완료');
    } catch (error) {
      console.error('초기 데이터 로딩 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '데이터 로딩 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 제품 목록 조회
  const fetchProductOptions = async () => {
    try {
      const { data } = await executeQuery({
        query: PRODUCT_OPTIONS
      });

      if (data && data.productMaterials) {
        const formattedOptions = data.productMaterials.map(product => ({
          systemMaterialId: product.systemMaterialId,
          userMaterialId: product.userMaterialId,
          materialName: product.materialName,
          materialType: product.materialType,
          materialStandard: product.materialStandard,
          materialCategory: product.materialCategory,
          unit: product.unit
        }));
        console.log('제품 목록 로드 완료:', formattedOptions.length, '개 항목');
        setProductOptions(formattedOptions);
      } else {
        console.warn('제품 목록 데이터가 없습니다:', data);
      }
    } catch (error) {
      console.error('제품 목록 조회 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '제품 목록을 불러오는 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  // 설비 목록 조회
  const fetchEquipmentOptions = async () => {
    try {
      const { data } = await executeQuery({
        query: EQUIPMENT_OPTIONS,
        variables: {
          filter: {
            factoryId: '',
            factoryName: '',
            lineId: '',
            lineName: '',
            equipmentId: '',
            equipmentName: '',
            equipmentSn: '',
            equipmentType: ''
          }
        }
      });

      if (data && data.getEquipments) {
        const formattedOptions = data.getEquipments.map(equipment => ({
          value: equipment.equipmentId,
          label: `${equipment.equipmentName || ''} (${equipment.equipmentId})`,
          factoryName: equipment.factoryName,
          lineName: equipment.lineName,
          equipmentType: equipment.equipmentType
        }));
        console.log('설비 목록 로드 완료:', formattedOptions.length, '개 항목');
        setEquipmentOptions(formattedOptions);
      } else {
        console.warn('설비 목록 데이터가 없습니다:', data);
      }
    } catch (error) {
      console.error('설비 목록 조회 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '설비 목록을 불러오는 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  // 생산실적 목록 조회
  const handleSearch = async (params = searchParams) => {
    try {
      setLoading(true);
      
      // 기본 필터 설정
      const filter = {
        flagActive: true
      };

      // 제품ID 필터 추가
      if (params.productId) {
        filter.productId = params.productId;
      }

      // 설비ID 필터 추가 (설비 선택 시)
      if (params.equipmentId) {
        filter.equipmentId = params.equipmentId;
      }
      
      console.log('생산실적 조회 필터:', filter);
      
      const { data } = await executeQuery({
        query: PRODUCTION_RESULTS_MOBILE,
        variables: {
          filter: filter
        }
      });

      if (data && data.productionResultsAtMobile) {
        // 날짜 내림차순으로 정렬 (최신순)
        const sortedResults = [...data.productionResultsAtMobile].sort((a, b) => {
          const dateA = a.createDate ? new Date(a.createDate) : new Date(0);
          const dateB = b.createDate ? new Date(b.createDate) : new Date(0);
          return dateB - dateA;
        });
        
        console.log('조회된 생산실적:', sortedResults.length, '건');
        setProductionResults(sortedResults);
      } else {
        console.log('생산실적 데이터가 없습니다:', data);
        setProductionResults([]);
      }
    } catch (error) {
      console.error('생산실적 조회 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '생산실적 조회 중 오류가 발생했습니다.',
        severity: 'error'
      });
      setProductionResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 핸들러
  const handleOpenEditDialog = (result) => {
    if (result) {
      setSelectedResult(result);
      setEditMode(true);
      
      // 불량정보가 있는 경우 설정
      if (result.defectInfos && result.defectInfos.length > 0) {
        setDefectInfos(result.defectInfos);
      } else {
        setDefectInfos([]);
      }
    } else {
      // 신규 모드
      setSelectedResult({
        id: generateId('NEW'),
        workOrderId: "",
        productId: "",
        goodQty: 0,
        defectQty: 0,
        equipmentId: "",
        resultInfo: "",
        defectCause: "",
        prodStartTime: null,
        prodEndTime: null,
        flagActive: true
      });
      setEditMode(false);
      setDefectInfos([]);
    }
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleOpenFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const handleOpenDefectInfoDialog = () => {
    setIsDefectInfoDialogOpen(true);
  };

  const handleCloseDefectInfoDialog = () => {
    setIsDefectInfoDialogOpen(false);
  };

  const handleFilterChange = (newFilter) => {
    setSearchParams(newFilter);
    handleSearch(newFilter);
    setIsFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setSearchParams(SEARCH_CONDITIONS);
    handleSearch(SEARCH_CONDITIONS);
  };

  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setSelectedResult(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // 생산 시작 핸들러
  const handleStartProduction = async (productionData) => {
    try {
      setSaving(true);
      console.log('생산 시작 데이터:', productionData);
      
      // 생산시작 데이터를 저장
      const { data } = await executeMutation({
        mutation: SAVE_PRODUCTION_RESULT,
        variables: {
          createdRows: [{
            workOrderId: productionData.workOrderId || null,
            productId: productionData.productId,
            goodQty: 0,
            defectQty: 0,
            equipmentId: productionData.equipmentId || null,
            resultInfo: null,
            defectCause: null,
            prodStartTime: productionData.prodStartTime,
            prodEndTime: null,
            flagActive: true
          }],
          updatedRows: [],
          defectInfos: []
        }
      });
      
      // 저장 성공 시 알림
      setSnackbar({
        open: true,
        message: '생산이 시작되었습니다.',
        severity: 'success'
      });
      
      // 생산 목록 갱신
      handleSearch();
      
      return data.saveProductionResult;
    } catch (error) {
      console.error('생산 시작 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '생산 시작 중 오류 발생: ' + error.message,
        severity: 'error'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // 생산 종료 핸들러
  const handleEndProduction = (endTime) => {
    console.log('생산 종료 시간:', endTime);
    // 생산 종료는 DB에 저장하지 않고 로컬 상태만 변경
    // 최종 저장은 사용자가 양품/불량 수량을 입력한 후 저장 버튼을 누를 때 처리
  };

  // 생산실적 저장 핸들러
  const handleSaveProductionResult = async (formData) => {
    try {
      setSaving(true);
      
      // 신규 모드인지 수정 모드인지 확인
      const isNewRecord = formData.id && formData.id.startsWith('NEW');
      
      const mutation = {
        mutation: SAVE_PRODUCTION_RESULT,
        variables: {
          createdRows: isNewRecord ? [{
            // 신규 생성 시에는 prodResultId 필드를 보내지 않음 (백엔드에서 생성)
            workOrderId: formData.workOrderId || null,
            productId: formData.productId,
            goodQty: parseFloat(formData.goodQty) || 0,
            defectQty: parseFloat(formData.defectQty) || 0,
            equipmentId: formData.equipmentId || null,
            resultInfo: formData.resultInfo || null,
            defectCause: formData.defectCause || null,
            prodStartTime: formData.prodStartTime,
            prodEndTime: formData.prodEndTime,
            flagActive: true
          }] : [],
          updatedRows: isNewRecord ? [] : [{
            // 수정 시에는 prodResultId 필드가 필요함
            prodResultId: formData.prodResultId,
            workOrderId: formData.workOrderId || null,
            productId: formData.productId,
            goodQty: parseFloat(formData.goodQty) || 0,
            defectQty: parseFloat(formData.defectQty) || 0,
            equipmentId: formData.equipmentId || null,
            resultInfo: formData.resultInfo || null,
            defectCause: formData.defectCause || null,
            prodStartTime: formData.prodStartTime,
            prodEndTime: formData.prodEndTime,
            flagActive: true
          }],
          defectInfos: defectInfos.map(info => ({
            prodResultId: isNewRecord ? null : formData.prodResultId, // 신규 생성 시 null로 설정
            productId: formData.productId, // 제품 ID 추가
            defectQty: parseFloat(info.defectQty) || 0,
            defectCause: info.defectCause || null,
            resultInfo: info.resultInfo || null,
            state: "NEW" // 상태 기본값 추가
          }))
        }
      };
      
      const { data } = await executeMutation(mutation);
      
      if (data.saveProductionResult) {
        setSnackbar({
          open: true,
          message: '생산실적이 저장되었습니다.',
          severity: 'success'
        });
        
        // 생산실적 목록 갱신
        handleSearch();
        
        // 다이얼로그 닫기
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('생산실적 저장 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '생산실적 저장 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // 삭제 확인 다이얼로그 열기
  const handleOpenDeleteConfirm = (prodResultId) => {
    setDeleteTargetId(prodResultId);
    setDeleteConfirmOpen(true);
  };

  // 삭제 확인 다이얼로그 닫기
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // 생산실적 삭제 핸들러
  const handleDeleteProductionResult = async () => {
    if (!deleteTargetId) return;
    
    try {
      setSaving(true);
      
      const { data } = await executeMutation({
        mutation: DELETE_PRODUCTION_RESULT,
        variables: {
          prodResultId: deleteTargetId
        }
      });
      
      if (data.deleteProductionResult) {
        setSnackbar({
          open: true,
          message: '생산실적이 삭제되었습니다.',
          severity: 'success'
        });
        
        // 생산실적 목록 갱신
        handleSearch();
      } else {
        setSnackbar({
          open: true,
          message: '생산실적 삭제 중 오류가 발생했습니다.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('생산실적 삭제 중 오류 발생:', error);
      setSnackbar({
        open: true,
        message: '생산실적 삭제 중 오류가 발생했습니다. ' + (error.message || ''),
        severity: 'error'
      });
    } finally {
      setSaving(false);
      handleCloseDeleteConfirm();
    }
  };

  const renderHeader = () => (
    <Box sx={{ mb: 2, pt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}
        >
          생산실적등록
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton
            onClick={handleOpenFilterDialog}
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
            onClick={() => handleOpenEditDialog(null)}
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
      {renderHeader()}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <ProductionResultList
            productionResults={productionResults}
            loading={loading}
            onEdit={handleOpenEditDialog}
            onAddNew={() => handleOpenEditDialog(null)}
            onDelete={handleOpenDeleteConfirm}
            getAccentColor={getAccentColor}
            getBorderColor={getBorderColor}
            productOptions={productOptions}
          />
        </Box>
      )}
      
      {/* 필터 다이얼로그 */}
      <ProductionResultFilterDialog
        open={isFilterDialogOpen}
        onClose={handleCloseFilterDialog}
        filter={searchParams}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        productOptions={productOptions}
        getAccentColor={getAccentColor}
      />
      
      {/* 생산실적 편집 다이얼로그 */}
      <ProductionResultEditDialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveProductionResult}
        onChange={handleResultChange}
        productionResult={selectedResult}
        editMode={editMode}
        productOptions={productOptions}
        equipmentOptions={equipmentOptions}
        onOpenDefectInfo={handleOpenDefectInfoDialog}
        defectInfos={defectInfos}
        getAccentColor={getAccentColor}
        onStartProduction={handleStartProduction}
        onEndProduction={handleEndProduction}
      />
      
      {/* 불량정보 다이얼로그 */}
      <DefectInfoDialog
        open={isDefectInfoDialogOpen}
        onClose={handleCloseDefectInfoDialog}
        defectInfos={defectInfos}
        onSave={(updatedDefectInfos) => {
          setDefectInfos(updatedDefectInfos);
          setIsDefectInfoDialogOpen(false);
        }}
        getAccentColor={getAccentColor}
        maxDefectQty={selectedResult?.defectQty ? parseFloat(selectedResult.defectQty) : null}
      />
      
      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          생산실적 삭제
        </DialogTitle>
        <DialogContent>
          <Typography>
            이 생산실적을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="inherit">
            취소
          </Button>
          <Button 
            onClick={handleDeleteProductionResult} 
            color="error" 
            variant="contained"
            disabled={saving}
          >
            {saving ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 알림 메시지 */}
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
          variant="filled"
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileProductionResult;
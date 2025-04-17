import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGraphQL } from "../../../apollo/useGraphQL";
import { useGridUtils } from "../../../utils/grid/useGridUtils";
import { format } from "date-fns";

import { MATERIAL_GET, MATERIAL_SAVE, MATERIAL_DELETE } from './ProductGraphQL';
import { SEARCH_CONDITIONS } from './ProductConstants';
import ProductList from './ProductList';
import ProductFilterDialog from './ProductFilterDialog';
import ProductEditDialog from './ProductEditDialog';

const MobileProductManagement = () => {
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

  const getBorderColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#3d2814' : '#f5e8d7') :
      (isDarkMode ? '#1e3a5f' : '#e0e0e0');

  // 상태 관리
  const [materialList, setMaterialList] = useState([]);
  const [searchParams, setSearchParams] = useState(SEARCH_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 데이터 포맷팅 함수
  const formatMaterialData = (data) => {
    if (!data || !data.getCompleteMaterials) return [];

    return data.getCompleteMaterials.map(material => ({
      ...material,
      id: material.systemMaterialId || generateId('TEMP')
    }));
  };

  // 신규 자재 생성 구조
  const createNewMaterial = () => ({
    id: generateId('NEW'),
    materialType: 'COMPLETE_PRODUCT',
    materialCategory: '',
    systemMaterialId: '',
    userMaterialId: '',
    materialName: '',
    materialStandard: '',
    unit: '',
    baseQuantity: 0,
    materialStorage: '',
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

  // 자재 데이터 포맷팅 (저장용)
  const transformRowForMutation = (row) => ({
    materialType: 'COMPLETE_PRODUCT',
    materialCategory: row.materialCategory || '',
    userMaterialId: row.userMaterialId || '',
    materialName: row.materialName || '',
    materialStandard: row.materialStandard || '',
    unit: row.unit || '',
    baseQuantity: Number(row.baseQuantity) || 0
  });

  // API 호출 함수들
  const handleSearch = async (params = searchParams) => {
    try {
      setLoading(true);
      const formattedParams = formatSearchParams(params);

      // filter 객체로 변수 구성
      const { data } = await executeQuery({
        query: MATERIAL_GET,
        variables: {
          filter: {
            userMaterialId: formattedParams.userMaterialId,
            materialName: formattedParams.materialName,
            fromDate: formattedParams.fromDate,
            toDate: formattedParams.toDate
          }
        }
      });

      const formattedData = formatMaterialData(data);
      setMaterialList(formattedData);
    } catch (error) {
      console.error('제품 조회 중 에러 발생:', error);
      setSnackbar({
        open: true,
        message: '제품 조회 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMaterial) return;

    // 필수값 체크
    if (!selectedMaterial.userMaterialId || !selectedMaterial.materialName) {
      setSnackbar({
        open: true,
        message: '제품ID와 제품명은 필수 입력 항목입니다.',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      const input = transformRowForMutation(selectedMaterial);

      if (editMode) {
        // 수정모드: updatedRows 배열에 추가
        const { data } = await executeMutation({
          mutation: MATERIAL_SAVE,
          variables: {
            createdRows: [],
            updatedRows: [{
              systemMaterialId: selectedMaterial.systemMaterialId,
              ...input
            }]
          }
        });

        if (data && data.saveMaterials) {
          setSnackbar({
            open: true,
            message: '제품 정보가 수정되었습니다.',
            severity: 'success'
          });
          handleSearch();
          setIsEditDialogOpen(false);
        }
      } else {
        // 신규모드: createdRows 배열에 추가
        const { data } = await executeMutation({
          mutation: MATERIAL_SAVE,
          variables: {
            createdRows: [input],
            updatedRows: []
          }
        });

        if (data && data.saveMaterials) {
          setSnackbar({
            open: true,
            message: '새 제품이 등록되었습니다.',
            severity: 'success'
          });
          handleSearch();
          setIsEditDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('제품 저장 중 에러 발생:', error);
      setSnackbar({
        open: true,
        message: '제품 저장 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (systemMaterialId) => {
    if (!systemMaterialId) {
      setSnackbar({
        open: true,
        message: '삭제할 제품을 선택해주세요.',
        severity: 'warning'
      });
      return;
    }

    const confirmed = window.confirm('선택한 제품을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setLoading(true);

      const { data } = await executeMutation({
        mutation: MATERIAL_DELETE,
        variables: {
          systemMaterialIds: [systemMaterialId]
        }
      });

      if (data && data.deleteMaterials) {
        setSnackbar({
          open: true,
          message: '제품이 삭제되었습니다.',
          severity: 'success'
        });
        handleSearch(); // 목록 새로고침
      }
    } catch (error) {
      console.error('제품 삭제 중 에러 발생:', error);
      setSnackbar({
        open: true,
        message: '제품 삭제 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 핸들러들
  const handleOpenNewDialog = () => {
    setSelectedMaterial(createNewMaterial());
    setEditMode(false);
    setIsAddMode(true);
    setIsEditDialogOpen(true);
  };

  const handleOpenEditDialog = (material) => {
    setSelectedMaterial(material);
    setEditMode(true);
    setIsAddMode(false);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleResetFilters = () => {
    setSearchParams(SEARCH_CONDITIONS);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch();
  }, []);

  const renderHeader = () => (
    <Box sx={{ mb: 2, pt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
          제품 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton
              onClick={() => setIsFilterDialogOpen(true)}
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
              onClick={handleOpenNewDialog}
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
        {(searchParams.userMaterialId || searchParams.materialName) && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchParams.userMaterialId && (
                  <Chip
                      label={`제품ID: ${searchParams.userMaterialId}`}
                      onDelete={() => {
                        setSearchParams(prev => {
                          const updated = { ...prev, userMaterialId: '' };
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
              {searchParams.materialName && (
                  <Chip
                      label={`제품명: ${searchParams.materialName}`}
                      onDelete={() => {
                        setSearchParams(prev => {
                          const updated = { ...prev, materialName: '' };
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

        {/* 제품 목록 컴포넌트 - 남은 공간을 모두 차지하도록 설정 */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <ProductList
              materialList={materialList}
              loading={loading}
              onEdit={handleOpenEditDialog}
              onDelete={handleDelete}
              onAddNew={handleOpenNewDialog}
              getAccentColor={getAccentColor}
              getBorderColor={getBorderColor}
          />
        </Box>

        {/* 필터 다이얼로그 */}
        <ProductFilterDialog
            open={isFilterDialogOpen}
            onClose={() => setIsFilterDialogOpen(false)}
            searchParams={searchParams}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onApplyFilters={() => {
              handleSearch();
              setIsFilterDialogOpen(false);
            }}
            getAccentColor={getAccentColor}
        />

        {/* 제품 추가/수정 다이얼로그 */}
        <ProductEditDialog
            open={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setIsAddMode(false);
            }}
            material={selectedMaterial}
            editMode={editMode}
            onInputChange={handleInputChange}
            onSave={handleSave}
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

export default MobileProductManagement;
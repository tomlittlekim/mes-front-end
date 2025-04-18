import React, { useCallback, useState, useEffect } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid, Button, Popover, Chip, FormControl, InputLabel, MenuItem, Select, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common';
import SearchForm from './SearchForm';
import { useInventoryMovement } from './hooks/useInventoryMovement';
import InventoryMovementChart from './InventoryMovementChart';
import { useMaterialData } from '../../MaterialManagement/hooks/useMaterialData';
import { useGraphQL } from '../../../apollo/useGraphQL';
import Message from "../../../utils/message/Message";

/**
 * 레포트 - 입출고 현황 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (tabId 등)
 * @returns {JSX.Element}
 */
const InventoryMovement = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { executeQuery, executeMutation } = useGraphQL();

  // 자재 데이터 관련 훅
  const {
    materials,
    isLoading: isMaterialLoading,
    getCategoriesByType,
    getMaterialsByTypeAndCategory,
    getMaterialById,
    refresh: refreshMaterialData
  } = useMaterialData(executeQuery);

  // materialData 객체 생성
  const materialData = {
    materials,
    getCategoriesByType,
    getMaterialsByTypeAndCategory,
    getMaterialById
  };

  // 다중 자재 선택 기능
  const [materialSelectModal, setMaterialSelectModal] = useState({
    open: false,
    materialType: '',
    materialCategory: '',
    materials: [],
    filteredMaterials: [],
    selectedMaterials: [], // 다중 선택을 위한 배열
  });

  // 선택된 자재 목록 (검색 조건에 사용)
  const [selectedSearchMaterials, setSelectedSearchMaterials] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    handleDateRangeChange,
    handleReset: originalHandleReset,
    handleSearch: originalHandleSearch,
    isLoading,
    chartData,
    refreshKey,
    reportData: fetchedReportData
  } = useInventoryMovement(props.tabId);

  const [receivingList, setReceivingList] = useState([]);

  useEffect(() => {
    if (fetchedReportData) {
      setReceivingList(fetchedReportData);
    }
  }, [fetchedReportData]);

  // 컴포넌트 마운트 시 자재 데이터 로드
  useEffect(() => {
    refreshMaterialData();
  }, []);

  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);

  // 제품 선택 모달 열기
  const handleOpenMaterialSelect = () => {
    setMaterialSelectModal(prev => ({
      ...prev,
      open: true
    }));
  };

  // 제품 선택 모달 닫기
  const handleCloseMaterialSelect = () => {
    setMaterialSelectModal(prev => ({
      ...prev,
      open: false
    }));
  };

  // 제품 타입 변경 시
  const handleTypeChange = (event) => {
    const materialType = event.target.value;
    if (!materialData?.materials) return;

    const allMaterials = materialData.materials.filter(m => m.materialType === materialType);

    setMaterialSelectModal(prev => ({
      ...prev,
      materialType,
      materials: allMaterials,
      filteredMaterials: allMaterials,
      materialCategory: '',
      selectedMaterials: [] // 타입 변경 시 선택 초기화
    }));
  };

  // 제품 카테고리 변경 시
  const handleCategoryChange = (event) => {
    const materialCategory = event.target.value;
    const filteredMaterials = materialCategory
      ? materialData.getMaterialsByTypeAndCategory(materialSelectModal.materialType, materialCategory)
      : materialSelectModal.materials;

    setMaterialSelectModal(prev => ({
      ...prev,
      materialCategory,
      filteredMaterials,
      selectedMaterials: [] // 카테고리 변경 시 선택 초기화
    }));
  };

  // 체크박스 토글
  const handleToggleMaterial = (material) => {
    setMaterialSelectModal(prev => {
      const currentIndex = prev.selectedMaterials.findIndex(m => m.systemMaterialId === material.systemMaterialId);
      const newSelected = [...prev.selectedMaterials];
      
      if (currentIndex === -1) {
        newSelected.push(material);
      } else {
        newSelected.splice(currentIndex, 1);
      }
      
      return {
        ...prev,
        selectedMaterials: newSelected
      };
    });
  };

  // 선택 완료
  const handleComplete = () => {
    if (materialSelectModal.selectedMaterials.length === 0) {
      Message.showWarning('최소한 하나의 제품을 선택해주세요.');
      return;
    }

    setSelectedSearchMaterials(materialSelectModal.selectedMaterials);
    handleCloseMaterialSelect();
    // Message.showSuccess(`${materialSelectModal.selectedMaterials.length}개의 제품이 선택되었습니다.`);
  };

  // 검색 조건에서 제품 제거
  const handleRemoveMaterial = (materialId) => {
    setSelectedSearchMaterials(prev => prev.filter(m => m.systemMaterialId !== materialId));
  };

  // 검색 핸들러 - 선택된 제품 ID 추가
  const handleSearch = (data) => {
    // 선택된 제품이 있는 경우만 materialNames 배열 추가
    const searchParams = {
      ...data,
    };
    
    // systemMaterialIds 필드는 더 이상 필요없음
    delete searchParams.systemMaterialIds;
    
    // 선택된 제품이 있는 경우에만 materialNames 추가 (제품 이름 사용)
    if (selectedSearchMaterials.length > 0) {
      // materialName(제품 이름)을 사용 - systemMaterialId(제품 ID) 대신
      searchParams.materialNames = selectedSearchMaterials.map(m => m.materialName);
    }
    
    console.log('검색 파라미터:', searchParams);
    originalHandleSearch(searchParams);
  };

  // 리셋 핸들러 - 선택된 제품도 초기화
  const handleReset = () => {
    originalHandleReset();
    setSelectedSearchMaterials([]);
  };

  const searchFormItems = SearchForm({ control, handleDateRangeChange });

  const receivingColumns = [
    { field: 'createDate', 
      headerName: '변동일자', 
      width: 160, 
      headerAlign: 'center', 
      align: 'center', 
      editable: false, 
      renderCell: (params) => {
        const raw = params.row?.createDate;
        if (!raw) return '';
        return raw.replace('T', ' ');
      },
    },
    { field: 'inOutType', 
      headerName: '입출고유형', 
      width: 70,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      renderCell: (params) => {
        const raw = params.row?.inOutType;
        let text = '';
        let color = '';
      
        if (raw === 'IN') {
          text = '입고';
          color = theme.palette.success.main;
        } else if (raw === 'OUT') {
          text = '출고';
          color = theme.palette.error.main;
        }
      
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              width: '100%' 
            }}
          >
            <Typography sx={{ color, fontWeight: 'bold', fontSize: '13px' }}>
              {text}
            </Typography>
          </Box>
        );
      },
     }, 
    { field: 'materialName', 
      headerName: '자재명', 
      width: 100,
      headerAlign: 'center',
      align: 'left',
      editable: false,
      flex: 1,
      },
    { field: 'changeQty', 
      headerName: '변동수량',
      width: 70,
      type: 'number',
      headerAlign: 'center',
      align: 'right',
      editable: false,
      renderCell: (params) => {
        const value = params.value;
        const color = value > 0 ? theme.palette.success.main : value < 0 ? theme.palette.error.main : 'inherit';
    
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              width: '100%',
              pr: 1
            }}
          >
            <Typography sx={{ color, fontWeight: '' }}>
              {value?.toLocaleString()}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${getBorderColor()}`, pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: getTextColor() }}>
          레포트 - 입출고 현황
        </Typography>
        <IconButton onClick={() => setIsHelpModalOpen(true)} sx={{ ml: 1, color: theme.palette.primary.main }}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      <SearchCondition onSearch={handleSubmit(handleSearch)} onReset={handleReset}>
        {searchFormItems}
        {/* 제품 선택 버튼 */}
        <Grid item xs={12} md={12} mt={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenMaterialSelect}
              disabled={isMaterialLoading}
            >
              {isMaterialLoading ? '자재 로딩중...' : '제품 선택'}
            </Button>
            
            {/* 선택된 제품 표시 영역 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, overflow: 'auto', maxHeight: '60px', flex: 1 }}>
              {selectedSearchMaterials.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  모든 제품
                </Typography>
              ) : (
                selectedSearchMaterials.map((material) => (
                  <Chip
                    key={material.systemMaterialId}
                    label={`${material.materialName} (${material.userMaterialId || ''})`}
                    size="small"
                    onDelete={() => handleRemoveMaterial(material.systemMaterialId)}
                  />
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </SearchCondition>

      <Grid container spacing={2} mt={0}>
        <Grid item xs={12} md={12}>
          <Box sx={{ height: 300, bgcolor: getBgColor(), borderRadius: 1, p: 2, border: `1px solid ${getBorderColor()}` }}>
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>품목별 입출고량 및 현재재고</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <InventoryMovementChart data={chartData} />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography sx={{ color: getTextColor() }}>{isLoading ? '차트 로딩 중...' : '데이터 없음'}</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={12} mt={3}>
          <EnhancedDataGridWrapper
            title="입출고 현황"
            key={refreshKey}
            rows={receivingList}
            columns={receivingColumns}
            loading={isLoading}
            buttons={[]}
            height={300}
            tabId={props.tabId + "-grid"}
            gridProps={{
              autoHeight: true,
              sx: {
                '& .MuiDataGrid-cell': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              },
              pagination: true,
              paginationMode: 'client',
              pageSizeOptions: [5, 10, 20, 50],
              initialState: {
                sorting: {
                  sortModel: [{ field: 'createDate', sort: 'desc' }],
                },
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              },
              density: 'standard',
              paginationPosition: 'bottom',
            }}
          />
        </Grid>
      </Grid>

      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="입출고 현황 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 설정된 기간 동안의 품목별 입고 수량, 출고 수량, 현재 재고 잔량을 조회합니다.
        </Typography>
      </HelpModal>

      {/* 다중 제품 선택 모달 */}
      <Dialog
        open={materialSelectModal.open}
        onClose={handleCloseMaterialSelect}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>제품 다중 선택</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>종류</InputLabel>
              <Select
                value={materialSelectModal.materialType}
                onChange={handleTypeChange}
                label="종류"
              >
                <MenuItem value="RAW_MATERIAL">원자재</MenuItem>
                <MenuItem value="SUB_MATERIAL">부자재</MenuItem>
                <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!materialSelectModal.materialType}>
              <InputLabel>제품 유형</InputLabel>
              <Select
                value={materialSelectModal.materialCategory}
                onChange={handleCategoryChange}
                label="제품 유형"
              >
                <MenuItem value="">전체</MenuItem>
                {[...new Set(materialSelectModal.materials.map(m => m.materialCategory))]
                  .filter(Boolean)
                  .map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* 제품 목록 체크박스 */}
            <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
              <List dense>
                {materialSelectModal.filteredMaterials.length > 0 ? (
                  materialSelectModal.filteredMaterials.map((material) => (
                    <ListItem 
                      key={material.systemMaterialId} 
                      button
                      onClick={() => handleToggleMaterial(material)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={materialSelectModal.selectedMaterials.some(m => m.systemMaterialId === material.systemMaterialId)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={material.materialName} 
                        secondary={`${material.userMaterialId || ''} | ${material.materialStandard || ''} | ${material.unit || ''}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="표시할 제품이 없습니다" />
                  </ListItem>
                )}
              </List>
            </Box>

            <Typography variant="body2" align="right">
              선택된 제품: {materialSelectModal.selectedMaterials.length}개
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMaterialSelect}>취소</Button>
          <Button onClick={handleComplete} variant="contained">선택 완료</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default InventoryMovement; 
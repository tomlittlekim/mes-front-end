// ProductionPlanManagement.js 수정

import React, { useCallback, useState } from 'react';
import './ProductionPlanManagement.css';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import useLocalStorageVO from '../../Common/UseLocalStorageVO';
import { SearchCondition } from '../../Common';
import PlanList from './components/PlanList';
import SearchForm from './SearchForm';
import { useProductionPlanManagement } from './hooks/useProductionPlanManagement';
import ProductMaterialSelector from "./editors/ProductMaterialSelector";

/**
 * 생산계획관리 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionPlanManagement = (props) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

  // 상태 및 커스텀 훅
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const {
    // 검색폼 상태 및 핸들러
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 생산계획 관련 상태 및 핸들러
    isLoading,
    planList,
    selectedPlan,
    handlePlanSelect,
    handleAdd,
    handleSave,
    handleDelete,
    handleProcessRowUpdate,

    // 그리드 행 관련 상태 - 추가
    addRows,
    updatedRows,

    // 제품 정보
    productMaterials,
    isProductMaterialsLoaded,

    // 고객사 정보
    vendors,
    isVendorsLoaded,
    vendorMap,

    // 에디터 컴포넌트
    CustomDateEditor,
    ShiftTypeEditor,
    ProductMaterialSelector,

    // 그리드 속성
    initialState,

    // 리프레시 키
    refreshKey
  } = useProductionPlanManagement(props.tabId);

  // 도메인별 색상 설정 함수
  const getTextColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  }, [domain, isDarkMode]);

  const getBgColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  }, [domain, isDarkMode]);

  const getBorderColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  }, [domain, isDarkMode]);

  // 그리드 속성
  const gridProps = {
    editMode: 'cell',
    processRowUpdate: handleProcessRowUpdate,
    onProcessRowUpdateError: (error) => {
      console.error('데이터 업데이트 오류:', error);
    },
    initialState: initialState,

    // slots 부분을 제거하여 PlanList.js 내의 renderEditCell이 작동하도록 함

    // 새로운 행 모드 설정
    isCellEditable: (params) => {
      // 새로 추가된 행이거나 기존 행의 편집 가능 컬럼인 경우에만 편집 가능
      return params.row.id?.toString().startsWith('NEW_') ||
          ['orderId', 'orderDetailId', 'productId', 'productName', 'planQty', 'shiftType', 'planStartDate', 'planEndDate'].includes(params.field);
    }
  };

  // 새로운 행 모드 설정 (조건부로 추가)
  if (addRows && addRows.length > 0) {
    gridProps.rowModesModel = {
      ...addRows.reduce((acc, row) => {
        if (row && row.id && row.id.toString().startsWith('NEW_')) {
          acc[row.id] = { mode: 'edit' };
        }
        return acc;
      }, {})
    };
  }

  // SearchForm 컴포넌트에서 반환하는 검색 요소들
  const searchFormItems = SearchForm({ 
    control, 
    handleDateRangeChange,
    onSearch: handleSubmit(handleSearch),
    productOptions: productMaterials
  });

  return (
      <Box sx={{ p: 0, minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          borderBottom: `1px solid ${getBorderColor()}`,
          pb: 1
        }}>
          <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: getTextColor()
              }}
          >
            생산계획관리
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              sx={{
                ml: 1,
                color: isDarkMode ? theme.palette.primary.light
                    : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.light, 0.1)
                      : alpha(theme.palette.primary.main, 0.05)
                }
              }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        {/* 검색 조건 영역 */}
        <SearchCondition
            onSearch={handleSubmit(handleSearch)}
            onReset={handleReset}
        >
          {searchFormItems}
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <PlanList
                    planList={planList}
                    onRowClick={handlePlanSelect}
                    onAdd={handleAdd}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    refreshKey={refreshKey}
                    tabId={props.tabId}
                    gridProps={gridProps}
                    productMaterials={productMaterials} // 명시적으로 전달
                    vendorMap={vendorMap} // 고객사 정보 매핑 객체 전달
                />
              </Grid>
            </Grid>
        )}

        {/* 하단 정보 영역 */}
        <Box mt={2} p={2} sx={{
          bgcolor: getBgColor(),
          borderRadius: 1,
          border: `1px solid ${getBorderColor()}`
        }}>
          <Stack spacing={1}>
            <Typography variant="body2" color={getTextColor()}>
              • 생산계획관리 화면에서는 제품별 생산계획을 효율적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 계획번호, 제품 정보, 제품유형, 주/야간 유형, 계획수량, 계획일자 등을 관리하여 생산 계획을 체계적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 계획을 등록하고 작업지시를 생성하여 공정별 생산 일정을 관리할 수 있습니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="생산계획관리 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 생산계획관리에서는 생산 계획 정보를 등록하고 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 계획번호, 제품 정보, 제품유형, 주/야간 유형, 계획수량, 계획일자 등을 관리하여 생산 계획을 체계적으로 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 생산 계획 정보는 작업 지시, 생산 실적 관리 등에서 활용됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 주문번호와 연계된 생산계획을 등록하여 주문-생산-출하 프로세스를 통합적으로 관리할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default ProductionPlanManagement;
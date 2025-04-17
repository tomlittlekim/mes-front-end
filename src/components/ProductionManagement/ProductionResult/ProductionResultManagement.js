import React, { useCallback, useEffect, useState } from 'react';
import './ProductionResultManagement.css';
import { Grid, Box, IconButton, Stack, Typography, useTheme, alpha, Alert } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import useLocalStorageVO from '../../Common/UseLocalStorageVO';
import { SearchCondition } from '../../Common';
import WorkOrderList from './components/WorkOrderList';
import ProductionResultList from './components/ProductionResultList';
import SearchForm from './SearchForm';
import DefectInfoModal from './components/DefectInfoModal';
import { useProductionResultManagement } from './hooks/useProductionResultManagement';

/**
 * 생산실적등록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionResultManagement = (props) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

  // 상태 및 커스텀 훅
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 불량유형 목록 (실제 구현에서는 API에서 가져올 수 있음)
  const [defectTypes, setDefectTypes] = useState([
    { value: 'APPEARANCE', label: '외관불량' },
    { value: 'FUNCTIONAL', label: '기능불량' },
    { value: 'DIMENSION', label: '치수불량' },
    { value: 'MATERIAL', label: '재질불량' },
    { value: 'PROCESS', label: '공정불량' },
    { value: 'PACKAGE', label: '포장불량' },
    { value: 'OTHER', label: '기타' }
  ]);

  const {
    // 검색폼 관련
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 작업지시 관련
    isLoading,
    workOrderList,
    selectedWorkOrder,
    handleWorkOrderSelect,

    // 생산실적 관련
    productionResultList,
    setProductionResultList,
    productionResult,
    setProductionResult,
    handleCreateResult,
    handleCreateIndependentResult, // 독립형 생산실적 생성 함수
    handleSave,
    handleDelete,
    handleProductionResultSelect,

    // 불량정보 모달 관련
    isDefectInfoModalOpen,
    openDefectInfoModal,
    closeDefectInfoModal,
    handleSaveDefectInfos,
    currentProductionResult,
    defectInfos,
    handleProductionResultEdit,

    // 옵션 데이터
    equipmentOptions,
    productOptions, // 제품 옵션 목록

    // 리프레시 키
    refreshKey
  } = useProductionResultManagement(props.tabId);

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
            생산실적등록
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
          <SearchForm
              control={control}
              equipmentOptions={equipmentOptions}
              productOptions={productOptions}
              handleDateRangeChange={handleDateRangeChange}
          />
        </SearchCondition>

        {/* 신규 기능 안내 메시지 */}
        <Alert
            severity="info"
            sx={{
              mb: 2,
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            }}
        >
          <Typography variant="body2" align="center">
            작업지시 없이도 생산실적을 등록할 수 있습니다.
            제품ID는 필수 입력 항목입니다.
          </Typography>
        </Alert>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              {/* 작업지시 목록 그리드 */}
              <Grid item xs={12} md={6}>
                <WorkOrderList
                    workOrderList={workOrderList}
                    onRowClick={handleWorkOrderSelect}
                    tabId={props.tabId}
                    height={450}  // 높이 일치
                    productOptions={productOptions} // productOptions 전달 확인
                />
              </Grid>

              {/* 생산실적 목록 그리드 */}
              <Grid item xs={12} md={6}>
                <ProductionResultList
                    productionResultList={productionResultList}
                    selectedWorkOrder={selectedWorkOrder}
                    onRowClick={handleProductionResultSelect}
                    onCreateResult={handleCreateResult}
                    onCreateIndependentResult={handleCreateIndependentResult}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    equipmentOptions={equipmentOptions}
                    productOptions={productOptions} // 제품 옵션 목록 확인
                    setProductionResultList={setProductionResultList}
                    setProductionResult={setProductionResult}
                    productionResult={productionResult}
                    onRowEdit={handleProductionResultEdit}
                    tabId={props.tabId}
                    height={450}  // 높이 일치
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
              • 생산실적등록 화면에서는 생산실적을 등록하고 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시와 연계하여 생산실적을 등록하거나, 작업지시 없이 독립적으로 생산실적을 등록할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 생산실적 등록 시 제품ID는 필수 입력 항목입니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 생산수량, 양품/불량 수량, 작업시간 등의 정보를 기록하여 생산이력을 관리합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 불량수량이 1개 이상인 경우 불량정보를 반드시 입력해야 생산실적이 저장됩니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="생산실적등록 도움말"
        >
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 생산실적등록에서는 생산 작업의 실적 정보를 등록하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 두 가지 방식으로 생산실적을 등록할 수 있습니다:
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph sx={{ pl: 2 }}>
            1. 작업지시목록에서 작업지시를 선택한 후 '등록' 버튼을 클릭 (작업지시 연계)
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph sx={{ pl: 2 }}>
            2. '독립 생산실적' 버튼을 클릭하여 작업지시 없이 등록 (제품ID 직접 입력 필요)
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 양품수량, 불량수량을 입력하면 자동으로 진척률과 불량률이 계산됩니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 불량수량이 1개 이상인 경우, 불량정보를 등록해야 저장할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 저장 버튼을 클릭하여 입력한 생산실적 정보를 저장합니다.
          </Typography>
        </HelpModal>

        {/* 불량정보 모달 */}
        {isDefectInfoModalOpen && (
            <DefectInfoModal
                open={isDefectInfoModalOpen}
                onClose={closeDefectInfoModal}
                onSave={handleSaveDefectInfos}
                productionResult={currentProductionResult}
                selectedWorkOrder={selectedWorkOrder}
                defectTypes={defectTypes}
            />
        )}
      </Box>
  );
};

export default ProductionResultManagement;
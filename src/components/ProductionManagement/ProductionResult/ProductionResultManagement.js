import React, { useCallback, useEffect, useState } from 'react';
import './ProductionResultManagement.css';
import { Box, IconButton, Stack, Typography, useTheme, alpha } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import useLocalStorageVO from '../../Common/UseLocalStorageVO';
import { SearchCondition } from '../../Common';
import WorkOrderList from './components/WorkOrderList';
import ProductionResultList from './components/ProductionResultList';
import DefectInfoList from './components/DefectInfo/DefectInfoList';
import SearchForm from './SearchForm';
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

  const {
    // 검색폼 상태 및 핸들러
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 작업지시 관련 상태
    isLoading,
    workOrderList,
    selectedWorkOrder,
    handleWorkOrderSelect,

    // 생산실적 관련 상태
    productionResultList,
    productionResult,
    handleCreateResult,
    handleSave,
    handleDelete,
    handleProductionResultSelect,

    // 불량정보 관련 상태
    defectList,
    handleOpenDefectModal,
    handleEditDefect,
    handleDeleteDefect,

    // 옵션 데이터
    equipmentOptions,

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
              handleDateRangeChange={handleDateRangeChange}
          />
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 상단 그리드 영역 */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                {/* 작업지시 목록 그리드 */}
                <Box sx={{ flex: 1 }}>
                  <WorkOrderList
                      workOrderList={workOrderList}
                      onRowClick={handleWorkOrderSelect}
                      tabId={props.tabId}
                  />
                </Box>

                {/* 생산실적 목록 그리드 */}
                <Box sx={{ flex: 1 }}>
                  <ProductionResultList
                      productionResultList={productionResultList}
                      selectedWorkOrder={selectedWorkOrder}
                      onRowClick={handleProductionResultSelect}
                      onCreateResult={handleCreateResult}
                      onSave={handleSave}
                      onDelete={handleDelete}
                      equipmentOptions={equipmentOptions}
                      tabId={props.tabId}
                  />
                </Box>
              </Stack>

              {/* 불량정보 영역 */}
              {selectedWorkOrder && productionResult && (
                  <DefectInfoList
                      defectList={defectList}
                      onOpenDefectModal={handleOpenDefectModal}
                      onEditDefect={handleEditDefect}
                      onDeleteDefect={handleDeleteDefect}
                  />
              )}
            </Box>
        )}

        {/* 하단 정보 영역 */}
        <Box mt={2} p={2} sx={{
          bgcolor: getBgColor(),
          borderRadius: 1,
          border: `1px solid ${getBorderColor()}`
        }}>
          <Stack spacing={1}>
            <Typography variant="body2" color={getTextColor()}>
              • 생산실적등록 화면에서는 작업지시에 따른 생산실적을 등록하고 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시목록에서 특정 작업지시를 선택하면 해당 작업지시의 생산실적을 등록할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 생산수량, 양품/불량 수량, 작업시간 등의 정보를 기록하여 생산이력을 관리합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 불량정보를 등록하여 상세한 불량 원인과 수량을 관리할 수 있습니다.
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
            • 작업지시목록에서 작업지시를 선택한 후 신규 등록 버튼을 클릭하여 생산실적을 등록합니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 양품수량, 불량수량을 입력하면 자동으로 진척률과 불량률이 계산됩니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 불량정보 추가 버튼을 클릭하여 상세한 불량 정보(유형, 수량, 원인 등)를 등록할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 저장 버튼을 클릭하여 입력한 생산실적 정보를 저장합니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default ProductionResultManagement;
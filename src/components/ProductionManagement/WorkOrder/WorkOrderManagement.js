import React, { useState } from 'react';
import './WorkOrderManagement.css';
import { Box, Typography, IconButton, alpha, useTheme, Stack } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Grid } from '@mui/material';
import HelpModal from '../../Common/HelpModal';

import SearchForm from './SearchForm';
import PlanList from './components/PlanList';
import WorkOrderList from './components/WorkOrderList';
import { useWorkOrderManagement } from './hooks/useWorkOrderManagement';
import { useDomain, DOMAINS } from '../../../contexts/DomainContext';

/**
 * 작업지시관리 메인 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const WorkOrderManagement = (props) => {
  // 테마 및 도메인 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 커스텀 훅 사용 - 모든 상태 및 핸들러 로직이 포함됨
  const {
    isLoading,
    planList,
    workOrderList,
    selectedPlan,
    selectedWorkOrder,
    refreshKey,
    handleSearch,
    handleReset,
    handlePlanSelect,
    handleWorkOrderSelect,
    handleAddWorkOrder,
    handleSaveWorkOrder,
    handleDeleteWorkOrder,
    handleStartWork,
    handleCompleteWork,
    handleProcessRowUpdate,
    getTextColor,
    getBgColor,
    getBorderColor,
    productMaterials
  } = useWorkOrderManagement(props.tabId);

  return (
      <Box sx={{ p: 0, minHeight: '100vh' }} className="work-order-container">
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
            작업지시관리
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              sx={{
                ml: 1,
                color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDarkMode ? alpha(theme.palette.primary.light, 0.1) : alpha(theme.palette.primary.main, 0.05)
                }
              }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        {/* 검색 조건 영역 */}
        <SearchForm
            onSearch={handleSearch}
            onReset={handleReset}
        />

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              {/* 생산계획 그리드 - 왼쪽 */}
              <Grid item xs={12} md={6}>
                <PlanList
                    planList={planList}
                    refreshKey={refreshKey}
                    onRowClick={handlePlanSelect}
                    tabId={props.tabId}
                    productMaterials={productMaterials}
                />
              </Grid>

              {/* 작업지시 그리드 - 오른쪽 */}
              <Grid item xs={12} md={6}>
                <WorkOrderList
                    workOrderList={workOrderList}
                    selectedPlan={selectedPlan}
                    refreshKey={refreshKey}
                    onRowClick={handleWorkOrderSelect}
                    onProcessRowUpdate={handleProcessRowUpdate}
                    onAddWorkOrder={handleAddWorkOrder}
                    onSaveWorkOrder={handleSaveWorkOrder}
                    onDeleteWorkOrder={handleDeleteWorkOrder}
                    onStartWork={handleStartWork}
                    onCompleteWork={handleCompleteWork}
                    tabId={props.tabId}
                    productMaterials={productMaterials}
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
              • 작업지시관리 화면에서는 생산계획에 따른 작업지시를 효율적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 좌측 생산계획 목록에서 계획을 선택하면 우측에 해당 계획에 대한 작업지시 목록이 표시됩니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시는 개별 등록이 가능합니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="작업지시관리 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시관리에서는 생산계획에 따른 작업지시를 등록하고 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 왼쪽 생산계획 목록에서 계획을 선택하면 오른쪽에 해당 계획과 연계된 작업지시 목록이 표시됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시 정보는 생산 실적 관리, 품질 관리 등에서 활용됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시는 수동으로 등록할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시의 상태(계획, 작업중, 완료 등)를 관리하여 생산 진행 상황을 실시간으로 파악할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default WorkOrderManagement;
import React, { useCallback, useState } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common';
import SearchForm from './SearchForm';
import { usePeriodicProduction } from './hooks/usePeriodicProduction';
import { periodicProductionColumns, periodicProductionGridProps } from './PeriodicProductionReport';
import PeriodicProductionChart from './PeriodicProductionChart';

/**
 * 레포트 - 기간별 생산 실적 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (tabId 등)
 * @returns {JSX.Element}
 */
const PeriodicProduction = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    handleDateRangeChange,
    handleReset,
    handleSearch,
    isLoading,
    reportData,
    chartData,
    refreshKey
  } = usePeriodicProduction(props.tabId);

  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);

  const searchFormItems = SearchForm({ control, handleDateRangeChange });

  const columns = periodicProductionColumns;
  const gridProps = periodicProductionGridProps;

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${getBorderColor()}`, pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: getTextColor() }}>
          레포트 - 기간별 생산 실적
        </Typography>
        <IconButton onClick={() => setIsHelpModalOpen(true)} sx={{ ml: 1, color: theme.palette.primary.main }}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      <SearchCondition onSearch={handleSubmit(handleSearch)} onReset={handleReset}>
        {searchFormItems}
      </SearchCondition>

      <Grid container spacing={2} mt={0}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 400, bgcolor: getBgColor(), borderRadius: 1, p: 2, border: `1px solid ${getBorderColor()}` }}>
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>일자별 생산량 추이</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <PeriodicProductionChart data={chartData} />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography sx={{ color: getTextColor() }}>{isLoading ? '차트 로딩 중...' : '데이터 없음'}</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <EnhancedDataGridWrapper
            title="데이터 목록"
            rows={reportData}
            columns={columns}
            loading={isLoading}
            refreshKey={refreshKey}
            height={400}
            gridProps={gridProps}
            tabId={props.tabId + "-grid"}
          />
        </Grid>
      </Grid>

      {/* 하단 정보 영역 등 추가 가능 */}

      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="기간별 생산 실적 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 설정된 기간 동안의 일자별 생산 수량, 불량 수, 가동 시간을 조회합니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default PeriodicProduction; 
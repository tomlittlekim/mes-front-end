import React, { useCallback, useState } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// import { DOMAINS, useDomain } from '../../../contexts/DomainContext'; // 경로 확인 및 필요시 주석 해제
import HelpModal from '../../Common/HelpModal'; // 경로 확인 및 필요시 주석 해제
import useLocalStorageVO from '../../Common/UseLocalStorageVO'; // 경로 확인 및 필요시 주석 해제
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common'; // EnhancedDataGridWrapper 추가
import SearchForm from './SearchForm';
// import PlanVsActualGrid from './PlanVsActualGrid'; // 이전 그리드 컴포넌트 제거
import { usePlanVsActual } from './hooks/usePlanVsActual';
import { planVsActualColumns, planVsActualGridProps } from './PlanVsActualReport'; // 컬럼/속성 정의 가져오기
import PlanVsActualChart from './PlanVsActualChart'; // 차트 컴포넌트 추가

/**
 * 레포트 - 계획 대비 실적 조회 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (tabId 등)
 * @returns {JSX.Element}
 */
const PlanVsActual = (props) => {
  const theme = useTheme();
  // const { domain } = useDomain(); // 필요시 사용
  const isDarkMode = theme.palette.mode === 'dark';
  // const { loginUser } = useLocalStorageVO(); // 필요시 사용

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 커스텀 훅 사용
  const {
    control,
    handleSubmit,
    reset,
    handleDateRangeChange,
    handleReset,
    handleSearch,
    isLoading,
    reportData,
    // gridColumns, // 훅에서 컬럼 직접 가져오지 않음
    // gridProps,   // 훅에서 그리드 속성 직접 가져오지 않음
    chartData, // 차트용 데이터 추가
    refreshKey
  } = usePlanVsActual(props.tabId);

  // 도메인별 스타일링 함수 (기존 코드 참고 또는 단순화)
  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);

  // SearchForm에 전달할 요소들
  const searchFormItems = SearchForm({ control, handleDateRangeChange });

  // EnhancedDataGridWrapper에 전달할 컬럼 및 속성
  const columns = planVsActualColumns; 
  const gridProps = planVsActualGridProps; 

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}> {/* 헤더 높이 고려 */} 
      {/* 페이지 제목 */} 
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${getBorderColor()}`, pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: getTextColor() }}>
          레포트 - 계획 대비 실적 조회
        </Typography>
        <IconButton onClick={() => setIsHelpModalOpen(true)} sx={{ ml: 1, color: theme.palette.primary.main }}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      {/* 검색 조건 영역 */} 
      <SearchCondition onSearch={handleSubmit(handleSearch)} onReset={handleReset}>
        {searchFormItems}
      </SearchCondition>

      {/* 차트 및 그리드 영역 */}
      <Grid container spacing={2} mt={0}> {/* mt 조정 */} 
        {/* 차트 영역 */}
        <Grid item xs={12} md={6}> {/* 너비 조절 */} 
          <Box sx={{ 
            height: 400, 
            bgcolor: getBgColor(), 
            borderRadius: 1, 
            p: 2, 
            border: `1px solid ${getBorderColor()}` 
          }}> 
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>달성률 현황</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <PlanVsActualChart data={chartData} />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography sx={{ color: getTextColor() }}>{isLoading ? '차트 로딩 중...' : '데이터 없음'}</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* 그리드 영역 */}
        <Grid item xs={12} md={6}> {/* 너비 조절 */} 
          <EnhancedDataGridWrapper
            title="데이터 목록"
            rows={reportData}
            columns={columns} // 정의된 컬럼 사용
            loading={isLoading}
            refreshKey={refreshKey}
            height={400} // 차트와 높이 맞춤
            gridProps={gridProps} // 정의된 그리드 속성 사용
            // buttons={...} // 필요시 버튼 추가
            // onRowClick={...} // 필요시 행 클릭 핸들러 추가
            tabId={props.tabId + "-grid"} // 고유 tabId 부여
          />
        </Grid>
      </Grid>

      {/* 하단 정보 영역 (선택 사항) */} 
      <Box mt={2} p={2} sx={{ bgcolor: getBgColor(), borderRadius: 1, border: `1px solid ${getBorderColor()}` }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 계획일자, 품목, 설비를 기준으로 계획 수량과 실적 수량을 비교하여 달성률과 차이를 조회합니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */} 
      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="계획 대비 실적 조회 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 이 레포트는 설정된 기간 내의 생산 계획 대비 실제 생산 실적을 비교 분석하는 데 사용됩니다.
        </Typography>
        {/* 추가 도움말 내용 */} 
      </HelpModal>
    </Box>
  );
};

export default PlanVsActual; 
import React, { useState } from 'react';
import './ProductionResultInquiry.css';
import { Box, Typography, IconButton, Stack, Grid, useTheme, alpha } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition } from '../../Common';

import ProductionResultList from './components/ProductionResultList';
import SearchForm from './SearchForm';
import { useProductionResultInquiry } from './hooks/useProductionResultInquiry';

/**
 * 생산실적조회 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionResultInquiry = (props) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // 커스텀 훅 사용
  const {
    // 검색폼 상태 및 핸들러
    control,
    handleSubmit,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 생산실적 관련 상태 및 핸들러
    isLoading,
    productionList,
    selectedProduction,
    handleProductionSelect,
    handlePrint,
    handleExport,

    // 색상 및 테마
    getTextColor,
    getBgColor,
    getBorderColor,

    // 그리드 설정
    initialState,

    // 리프레시 키
    refreshKey
  } = useProductionResultInquiry(props.tabId);

  // SearchForm 컴포넌트에서 반환하는 검색 요소들
  const searchFormItems = SearchForm({
    control,
    handleDateRangeChange
  });

  // 그리드 속성
  const gridProps = {
    initialState: initialState
  };

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
            생산실적조회
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              sx={{
                ml: 1,
                color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
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
            title="조회조건"
        >
          {searchFormItems}
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ProductionResultList
                    productionList={productionList}
                    refreshKey={refreshKey}
                    onRowClick={handleProductionSelect}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    tabId={props.tabId}
                    gridProps={gridProps}
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
              • 생산실적조회 화면에서는 등록된 생산실적을 조회할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 생산일자, 제품, 작업지시 등의 조건으로 검색이 가능합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 그리드 헤더의 필터 기능을 사용하여 데이터를 필터링할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 출력 버튼을 통해 생산실적 정보를 인쇄하거나 엑셀로 내보낼 수 있습니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="생산실적조회 도움말"
        >
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 생산실적조회에서는 생산 작업의 실적 정보를 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 상단의 검색조건을 사용하여 특정 기간, 제품, 작업지시 등의 생산실적을 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 그리드의 컬럼을 클릭하여 정렬하거나, 필터 기능을 사용하여 데이터를 필터링할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 생산실적 데이터는 공장/라인/설비별로 그룹화하여 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 출력 기능을 통해 생산실적 데이터를 인쇄할 수 있으며, 엑셀 내보내기 기능을 통해 분석용 데이터를 추출할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default ProductionResultInquiry;
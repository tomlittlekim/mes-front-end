import React, { useState } from 'react';
import './ProductionResultInquiry.css';
import { Box, Typography, IconButton, Stack, Grid, useTheme, alpha, Alert, Button, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition } from '../../Common';
import SearchForm from './SearchForm';
import ProductionResultList from './components/ProductionResultList';
import { useProductionResultInquiry } from './hooks/useProductionResultInquiry';
import { useForm } from 'react-hook-form';

/**
 * 생산실적조회 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionResultInquiry = (props) => {
  // 테마 설정
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { domain } = useDomain();

  // react-hook-form 설정
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      prodResultId: '',
      workOrderId: '',
      productId: '',
      equipmentId: '',
      startDateRange: {
        startDate: null,
        endDate: null
      },
      endDateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (fieldName, startDate, endDate) => {
    setValue(fieldName, { startDate, endDate });
  };

  // 이전 버전과의 호환성을 위한 핸들러
  const handleStartDateRangeChange = (startDate, endDate) => {
    handleDateRangeChange('startDateRange', startDate, endDate);
  };

  const handleEndDateRangeChange = (startDate, endDate) => {
    handleDateRangeChange('endDateRange', startDate, endDate);
  };

  // 초기화 핸들러
  const handleReset = () => {
    reset({
      prodResultId: '',
      workOrderId: '',
      productId: '',
      equipmentId: '',
      startDateRange: {
        startDate: null,
        endDate: null
      },
      endDateRange: {
        startDate: null,
        endDate: null
      }
    });
  };

  // 커스텀 훅 사용
  const {
    // 생산실적 관련
    isLoading,
    productionResultList,
    handlePrint,
    handleExport,
    errorMessage,
    handleSearch,

    // 색상 및 테마
    getTextColor,
    getBgColor,
    getBorderColor,

    // 설비 옵션
    equipmentOptions,
    productOptions,

    // 리프레시 키
    refreshKey
  } = useProductionResultInquiry(props.tabId);

  // 검색 이벤트 핸들러
  const onSearch = (data) => {
    // 검색 실행
    handleSearch(data);
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

        {/* 오류 메시지 표시 */}
        {errorMessage && (
            <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button
                      color="inherit"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleSubmit(onSearch)}
                  >
                    다시 시도
                  </Button>
                }
            >
              {errorMessage}
            </Alert>
        )}

        {/* 검색 조건 영역 */}
        <SearchCondition
            onSearch={handleSubmit(onSearch)}
            onReset={handleReset}
        >
          {SearchForm({
              control,
              equipmentOptions,
              productOptions,
              handleDateRangeChange,
              handleStartDateRangeChange,
              handleEndDateRangeChange,
              onSearch: handleSubmit(onSearch)
          })}
        </SearchCondition>

        {/* 로딩 표시 */}
        {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
        )}

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ProductionResultList
                    productionResultList={productionResultList}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    tabId={props.tabId}
                    height={450}
                    productOptions={productOptions}
                    equipmentOptions={equipmentOptions}
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
              • 생산실적조회 화면에서는 완료된 작업지시에 대한 생산실적을 조회할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 생산수량, 양품/불량 수량, 작업시간 등의 정보를 확인하여 생산이력을 분석할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 출력 및 엑셀 내보내기 기능을 통해 생산실적 데이터를 활용할 수 있습니다.
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
            • 생산실적조회에서는 완료된 생산 작업의 실적 정보를 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 상단의 검색조건을 사용하여 특정 기간, 제품, 작업지시 등의 생산실적을 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 그리드의 컬럼을 클릭하여 정렬하거나, 필터 기능을 사용하여 데이터를 필터링할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 출력 및 엑셀 내보내기 기능을 통해 생산실적 데이터를 활용할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default ProductionResultInquiry;
import React, { useState } from 'react';
import './DefectInfoInquiry.css';
import { Box, Typography, IconButton, Stack, Grid, useTheme, alpha, Alert, Button, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition } from '../../Common';
import SearchForm from './SearchForm';
import DefectInfoList from './components/DefectInfoList';
import { useDefectInfoInquiry } from './hooks/useDefectInfoInquiry';
import { useForm } from 'react-hook-form';
import { bottomInfoMessages, helpModalMessages } from './constants';

// 폼 기본값 상수 정의
const FORM_DEFAULT_VALUES = {
  defectId: '',
  prodResultId: '',
  productId: '',
  equipmentId: '',
  dateRange: {
    startDate: null,
    endDate: null
  }
};

/**
 * 불량조회 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DefectInfoInquiry = (props) => {
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
    watch,
    getValues,
  } = useForm({
    defaultValues: FORM_DEFAULT_VALUES
  });

  // 초기화 핸들러
  const handleReset = () => {
    reset(FORM_DEFAULT_VALUES);
  };

  // 커스텀 훅 사용
  const {
    // 불량 정보 관련
    isLoading,
    defectInfoList,
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
  } = useDefectInfoInquiry(props.tabId);

  // 검색 이벤트 핸들러
  const onSearch = (data) => {
    // 검색 실행
    handleSearch(data);
  };

  return (
      <Box className="defect-info-inquiry-container" sx={{ p: 0 }}>
        <Box className="page-header" sx={{ borderBottom: `1px solid ${getBorderColor()}` }}>
          <Typography
              variant="h5"
              component="h2"
              className="page-title"
              sx={{
                fontWeight: 600,
                color: getTextColor()
              }}
          >
            불량조회
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              className="help-icon-button"
              sx={{
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
                className="error-alert"
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
          })}
        </SearchCondition>

        {/* 로딩 표시 */}
        {isLoading && (
            <Box className="loading-indicator-container">
              <CircularProgress />
            </Box>
        )}

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DefectInfoList
                    defectInfoList={defectInfoList}
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
        <Box className="info-box" mt={2} p={2} sx={{
          bgcolor: getBgColor(),
          border: `1px solid ${getBorderColor()}`
        }}>
          <Stack spacing={1}>
            {bottomInfoMessages.map((message, index) => (
              <Typography key={index} variant="body2" color={getTextColor()}>
                {message}
              </Typography>
            ))}
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title={helpModalMessages.title}
        >
          {helpModalMessages.paragraphs.map((paragraph, index) => (
            <Typography key={index} variant="body2" color={getTextColor()} paragraph>
              {paragraph}
            </Typography>
          ))}
        </HelpModal>
      </Box>
  );
};

export default DefectInfoInquiry; 
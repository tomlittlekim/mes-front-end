import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Stack,
  useTheme,
  alpha,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import useLocalStorageVO from '../../Common/UseLocalStorageVO';
import { SearchCondition } from '../../Common';
import SearchForm from './SearchForm';
import DefectList from './components/DefectList';
import { useDefectManagement } from './hooks/useDefectManagement';
import './DefectManagement.css';

/**
 * 불량관리 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DefectManagement = (props) => {
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
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 불량정보 관련 상태 및 핸들러
    isLoading,
    defectList,
    selectedDefect,
    handleDefectSelect,
    handlePrint,
    handleExport,
    errorMessage, // 오류 메시지

    // 리프레시 키
    refreshKey
  } = useDefectManagement(props.tabId);

  // 도메인별 색상 설정 함수
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };

  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  };

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  // SearchForm 컴포넌트에서 반환하는 검색 요소들
  const searchFormItems = SearchForm({ control, handleDateRangeChange });

  return (
      <Box sx={{ p: 0, minHeight: '100vh' }} className="defect-info-container">
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
            불량관리
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
                      onClick={handleSubmit(handleSearch)}
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
            onSearch={handleSubmit(handleSearch)}
            onReset={handleReset}
        >
          {searchFormItems}
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
                <DefectList
                    defectList={defectList}
                    onRowClick={handleDefectSelect}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    refreshKey={refreshKey}
                    tabId={props.tabId}
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
              • 불량관리 화면에서는 생산 과정에서 발생한 불량 정보를 조회할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시ID, 생산실적ID, 제품ID, 제품명, 불량유형, 상태, 등록일자 등의 다양한 조건으로 검색이 가능합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 엑셀 내보내기를 통해 불량 데이터를 보고서용으로 활용할 수 있습니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="불량관리 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 불량관리에서는 제품별, 공정별 불량 발생 현황을 조회할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시ID, 생산실적ID, 제품ID, 제품명, 불량유형, 상태, 등록일자 등 다양한 조건으로 검색할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 특정 조건을 입력하지 않으면 모든 불량 정보가 조회됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 엑셀 내보내기를 통해 불량 데이터를 보고서용으로 활용할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default DefectManagement;
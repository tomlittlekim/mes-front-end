import React, { useCallback, useState } from 'react';
import './DefectInquiry.css';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import HelpModal from '../../Common/HelpModal';
import useLocalStorageVO from '../../Common/UseLocalStorageVO';
import { SearchCondition } from '../../Common';
import DefectList from './components/DefectList';
import SearchForm from './SearchForm';
import { useDefectInquiry } from './hooks/useDefectInquiry';
import { format } from 'date-fns';

/**
 * 불량조회 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DefectInquiry = (props) => {
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
    handleViewDetail,
    isDetailDialogOpen,
    handleCloseDetail,

    // 리프레시 키
    refreshKey
  } = useDefectInquiry(props.tabId);

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

  // 불량 상태 매핑
  const getStateLabel = (state) => {
    const stateMap = {
      'NEW': '신규',
      'PROCESSING': '처리중',
      'COMPLETED': '완료됨'
    };
    return stateMap[state] || state || '';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (error) {
      return '';
    }
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
            불량조회
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
        >
          {searchFormItems}
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DefectList
                    defectList={defectList}
                    onRowClick={handleDefectSelect}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onViewDetail={handleViewDetail}
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
              • 불량조회 화면에서는 생산 과정에서 발생한 불량 정보를 조회할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시, 생산실적, 제품, 불량유형 등의 다양한 조건으로 검색이 가능합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 상세보기를 통해 불량의 세부 정보를 확인할 수 있습니다.
            </Typography>
          </Stack>
        </Box>

        {/* 불량 상세 정보 모달 */}
        <Dialog
            open={isDetailDialogOpen}
            onClose={handleCloseDetail}
            maxWidth="md"
            fullWidth
        >
          <DialogTitle>
            불량 상세 정보 - {selectedDefect?.defectId}
          </DialogTitle>
          <DialogContent dividers>
            {selectedDefect && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="불량ID"
                        value={selectedDefect.defectId || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="작업지시ID"
                        value={selectedDefect.workOrderId || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="생산실적ID"
                        value={selectedDefect.prodResultId || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="제품ID"
                        value={selectedDefect.productId || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="제품명"
                        value={selectedDefect.productName || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="불량유형"
                        value={selectedDefect.resultInfo || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="불량수량"
                        value={selectedDefect.defectQty ? selectedDefect.defectQty.toLocaleString() : '0'}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="상태"
                        value={getStateLabel(selectedDefect.state)}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        label="불량원인"
                        value={selectedDefect.defectCause || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        multiline
                        rows={2}
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="등록일"
                        value={formatDate(selectedDefect.createDate)}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="등록자"
                        value={selectedDefect.createUser || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="수정일"
                        value={formatDate(selectedDefect.updateDate)}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                        label="수정자"
                        value={selectedDefect.updateUser || ''}
                        fullWidth
                        size="small"
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetail}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="불량조회 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 불량조회에서는 제품별, 공정별 불량 발생 현황을 조회할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시ID, 생산실적ID, 제품ID, 불량유형, 등록일자 등 다양한 조건으로 검색할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 상세보기를 통해 불량의 세부 정보를 확인할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 엑셀 내보내기를 통해 불량 데이터를 보고서용으로 활용할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default DefectInquiry;
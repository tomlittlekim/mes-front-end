import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './DefectInquiry.css';
import { useForm, Controller } from 'react-hook-form';
import useLocalStorageVO from '../Common/UseLocalStorageVO';
import {
  TextField,
  Grid,
  Box,
  Typography,
  useTheme,
  Stack,
  IconButton,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Tab,
  Tabs,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { EnhancedDataGridWrapper, SearchCondition } from '../Common';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import DateRangePicker from '../Common/DateRangePicker';
import { format } from 'date-fns';
import Message from '../../utils/message/Message';
import ko from "date-fns/locale/ko";
import { useGridUtils } from '../../utils/grid/useGridUtils';
import { useGraphQL } from "../../apollo/useGraphQL";
import { gql } from '@apollo/client';

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
  const { executeQuery } = useGraphQL();

  // React Hook Form 설정
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      workOrderId: '',
      prodResultId: '',
      productId: '',
      defectType: '',
      state: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [defectList, setDefectList] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [statsData, setStatsData] = useState({
    productStats: [],
    causeStats: []
  });

  // 그리드 유틸리티 훅 사용
  const { formatDateToYYYYMMDD } = useGridUtils();

  // GraphQL 쿼리 정의
  const DEFECT_INFO_LIST_QUERY = gql`
      query defectInfoList($filter: DefectInfoFilter) {
          defectInfoList(filter: $filter) {
              defectId
              workOrderId
              prodResultId
              productId
              productName
              defectQty
              defectType
              resultInfo
              defectCause
              state
              createDate
              updateDate
              createUser
          }
      }
  `;

  const DEFECT_STATS_BY_PRODUCT_QUERY = gql`
      query defectStatsByProduct($fromDate: String!, $toDate: String!) {
          defectStatsByProduct(fromDate: $fromDate, toDate: $toDate) {
              productId
              productName
              totalDefectQty
              defectCount
              defectTypes {
                  defectType
                  count
                  qty
                  percentage
              }
              defectCauses {
                  cause
                  count
                  qty
                  percentage
              }
          }
      }
  `;

  const DEFECT_STATS_BY_CAUSE_QUERY = gql`
      query defectStatsByCause($fromDate: String!, $toDate: String!) {
          defectStatsByCause(fromDate: $fromDate, toDate: $toDate) {
              defectCause
              totalDefectQty
              defectCount
              products {
                  productId
                  productName
                  qty
                  count
                  percentage
              }
          }
      }
  `;

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

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      workOrderId: '',
      prodResultId: '',
      productId: '',
      defectType: '',
      state: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('dateRange', {startDate, endDate});
  }, [setValue]);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setIsLoading(true);
    setSelectedDefect(null);

    // 날짜 형식 변환 - null 값도 허용
    const filterData = {...data};

    // dateRange 객체에서 시작일, 종료일 범위를 추출하여 필터 데이터로 변환
    if (filterData.dateRange) {
      if (filterData.dateRange.startDate) {
        try {
          filterData.fromDate = format(filterData.dateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.fromDate = null;
        }
      }

      if (filterData.dateRange.endDate) {
        try {
          filterData.toDate = format(filterData.dateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.toDate = null;
        }
      }

      // dateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.dateRange;
    }

    // 불량 정보 검색
    executeQuery({
      query: DEFECT_INFO_LIST_QUERY,
      variables: { filter: filterData }
    })
    .then(response => {
      if (response.data && response.data.defectInfoList) {
        setDefectList(response.data.defectInfoList.map(item => ({
          ...item,
          id: item.defectId
        })));
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching defect info:", error);
      Message.showError({message: '불량 정보를 불러오는데 실패했습니다.'});
      setIsLoading(false);
      setDefectList([]);
    });

    // 통계 데이터 조회 (날짜 범위가 있는 경우만)
    if (filterData.fromDate && filterData.toDate) {
      loadStatistics(filterData.fromDate, filterData.toDate);
    }
  }, [executeQuery, DEFECT_INFO_LIST_QUERY]);

  // 통계 데이터 로드 함수
  const loadStatistics = useCallback((fromDate, toDate) => {
    // 제품별 불량 통계 조회
    executeQuery({
      query: DEFECT_STATS_BY_PRODUCT_QUERY,
      variables: { fromDate, toDate }
    })
    .then(response => {
      if (response.data && response.data.defectStatsByProduct) {
        setStatsData(prev => ({
          ...prev,
          productStats: response.data.defectStatsByProduct
        }));
      }
    })
    .catch(error => {
      console.error("Error fetching product statistics:", error);
    });

    // 원인별 불량 통계 조회
    executeQuery({
      query: DEFECT_STATS_BY_CAUSE_QUERY,
      variables: { fromDate, toDate }
    })
    .then(response => {
      if (response.data && response.data.defectStatsByCause) {
        setStatsData(prev => ({
          ...prev,
          causeStats: response.data.defectStatsByCause
        }));
      }
    })
    .catch(error => {
      console.error("Error fetching cause statistics:", error);
    });
  }, [executeQuery, DEFECT_STATS_BY_PRODUCT_QUERY, DEFECT_STATS_BY_CAUSE_QUERY]);

  // 불량 선택 핸들러
  const handleDefectSelect = useCallback((params) => {
    const defect = defectList.find(d => d.id === params.id);
    setSelectedDefect(defect);
  }, [defectList]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 상세 정보 모달 열기
  const handleOpenDetailModal = useCallback(() => {
    if (!selectedDefect) {
      Message.showWarning('상세 정보를 볼 불량을 선택해주세요.');
      return;
    }
    setIsDetailModalOpen(true);
  }, [selectedDefect]);

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    if (!selectedDefect) {
      Message.showWarning('출력할 불량정보를 선택해주세요.');
      return;
    }

    Message.showSuccess('불량정보가 출력됩니다.');
    // 실제 인쇄 기능 구현 필요
  }, [selectedDefect]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (defectList.length === 0) {
      Message.showWarning('내보낼 데이터가 없습니다.');
      return;
    }

    Message.showSuccess('불량정보 데이터가 엑셀로 내보내집니다.');
    // 실제 엑셀 내보내기 기능 구현 필요
  }, [defectList]);

  // 불량 분석 핸들러
  const handleAnalysis = useCallback(() => {
    setTabValue(1); // 통계 탭으로 이동
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    let isMounted = true;

    // 현재 날짜 기준 기본 날짜 범위 설정 (최근 7일)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    setValue('dateRange', { startDate, endDate });

    const timer = setTimeout(() => {
      if (isMounted) {
        handleSearch({
          dateRange: { startDate, endDate }
        });
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [handleSearch, setValue]);

  // 불량 유형 옵션
  const defectTypeOptions = useMemo(() => [
    { value: '외관불량', label: '외관불량' },
    { value: '기능불량', label: '기능불량' },
    { value: '치수불량', label: '치수불량' },
    { value: '재질불량', label: '재질불량' },
    { value: '기타', label: '기타' }
  ], []);

  // 상태 옵션
  const stateOptions = useMemo(() => [
    { value: 'NEW', label: '신규' },
    { value: 'PROCESSING', label: '처리중' },
    { value: 'COMPLETED', label: '완료됨' }
  ], []);

  // 불량 목록 그리드 컬럼 정의
  const defectColumns = useMemo(() => ([
    {
      field: 'defectId',
      headerName: '불량ID',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 130,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'prodResultId',
      headerName: '생산실적ID',
      width: 130,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productName',
      headerName: '제품명',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'resultInfo',
      headerName: '불량유형',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const defectType = params.value || '기타';
        let color = 'default';

        if (defectType.includes('외관')) color = 'warning';
        else if (defectType.includes('기능')) color = 'error';
        else if (defectType.includes('치수')) color = 'primary';
        else if (defectType.includes('재질')) color = 'secondary';

        return (
            <Chip
                label={defectType}
                size="small"
                color={color}
                variant="outlined"
            />
        );
      }
    },
    {
      field: 'defectQty',
      headerName: '불량수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        return (
            <Typography variant="body2" className={params.value > 5 ? "defect-highlight" : ""}>
              {params.value ? params.value.toLocaleString() : '0'}
            </Typography>
        );
      }
    },
    {
      field: 'defectCause',
      headerName: '불량원인',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'state',
      headerName: '상태',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const statusMap = {
          'NEW': { label: '신규', className: 'status-wait' },
          'PROCESSING': { label: '처리중', className: 'status-inprogress' },
          'COMPLETED': { label: '완료됨', className: 'status-completed' }
        };

        const status = statusMap[params.value] || { label: params.value, className: '' };

        return (
            <Typography variant="body2" className={status.className}>
              {status.label}
            </Typography>
        );
      }
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2"></Typography>;

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'actions',
      headerName: '상세보기',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
          <IconButton
              size="small"
              onClick={() => {
                setSelectedDefect(defectList.find(d => d.id === params.id));
                setIsDetailModalOpen(true);
              }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
      )
    }
  ]), [defectList]);

  // 불량 목록 그리드 버튼
  const defectGridButtons = useMemo(() => ([
    { label: '분석', onClick: handleAnalysis, icon: <AnalyticsIcon /> },
    { label: '출력', onClick: handlePrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: handleExport, icon: <FileDownloadIcon /> }
  ]), [handleAnalysis, handlePrint, handleExport]);

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

        {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
        <SearchCondition
            onSearch={handleSubmit(handleSearch)}
            onReset={handleReset}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="workOrderId"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="작업지시ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="작업지시ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="prodResultId"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="생산실적ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="생산실적ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="제품ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="제품ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="defectType"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="defectType-label">불량유형</InputLabel>
                      <Select
                          {...field}
                          labelId="defectType-label"
                          label="불량유형"
                      >
                        <MenuItem value="">전체</MenuItem>
                        {defectTypeOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="state"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="state-label">상태</InputLabel>
                      <Select
                          {...field}
                          labelId="state-label"
                          label="상태"
                      >
                        <MenuItem value="">전체</MenuItem>
                        {stateOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <Controller
                  name="dateRange"
                  control={control}
                  render={({ field }) => (
                      <DateRangePicker
                          startDate={field.value.startDate}
                          endDate={field.value.endDate}
                          onRangeChange={handleDateRangeChange}
                          startLabel="시작일"
                          endLabel="종료일"
                          label="등록일자"
                          size="small"
                      />
                  )}
              />
            </LocalizationProvider>
          </Grid>
        </SearchCondition>

        {/* 탭 영역 */}
        <Box sx={{ mb: 2 }}>
          <Paper>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
              <Tab label="불량 목록" />
              <Tab label="불량 통계" />
            </Tabs>
          </Paper>
        </Box>

        {/* 불량 목록 탭 */}
        {tabValue === 0 && (
            <EnhancedDataGridWrapper
                title="불량정보 목록"
                key={refreshKey}
                rows={defectList}
                columns={defectColumns}
                buttons={defectGridButtons}
                height={500}
                onRowClick={handleDefectSelect}
                tabId={props.tabId + "-defect-info"}
                gridProps={{}}
                loading={isLoading}
            />
        )}

        {/* 불량 통계 탭 */}
        {tabValue === 1 && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom>불량 통계 분석</Typography>

              {/* 제품별 통계 */}
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>제품별 불량 통계</Typography>
              <Grid container spacing={2}>
                {statsData.productStats.length > 0 ? (
                    statsData.productStats.map((stat, index) => (
                        <Grid item xs={12} md={6} lg={4} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" color="primary" gutterBottom>
                                {stat.productName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                제품 ID: {stat.productId}
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">총 불량 수량: <strong>{stat.totalDefectQty.toLocaleString()}</strong></Typography>
                                <Typography variant="body2">불량 건수: <strong>{stat.defectCount}</strong></Typography>
                              </Box>

                              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>불량 유형별 분포</Typography>
                              <Box sx={{ mb: 2 }}>
                                {stat.defectTypes.map((type, idx) => (
                                    <Box key={idx} sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2">{type.defectType}</Typography>
                                        <Typography variant="body2">{type.percentage.toFixed(1)}%</Typography>
                                      </Box>
                                      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 8, overflow: 'hidden' }}>
                                        <Box
                                            sx={{
                                              width: `${type.percentage}%`,
                                              bgcolor: idx % 4 === 0 ? 'primary.main' :
                                                  idx % 4 === 1 ? 'error.main' :
                                                      idx % 4 === 2 ? 'warning.main' : 'secondary.main',
                                              height: 8
                                            }}
                                        />
                                      </Box>
                                    </Box>
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          제품별 불량 통계 데이터가 없습니다.
                        </Typography>
                      </Paper>
                    </Grid>
                )}
              </Grid>

              {/* 원인별 통계 */}
              <Typography variant="subtitle1" sx={{ mt: 4, mb: 1, fontWeight: 500 }}>원인별 불량 통계</Typography>
              <Grid container spacing={2}>
                {statsData.causeStats.length > 0 ? (
                    statsData.causeStats.map((stat, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" color="error" gutterBottom>
                                {stat.defectCause}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">총 불량 수량: <strong>{stat.totalDefectQty.toLocaleString()}</strong></Typography>
                                <Typography variant="body2">불량 건수: <strong>{stat.defectCount}</strong></Typography>
                              </Box>

                              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>제품별 분포</Typography>
                              {stat.products.slice(0, 5).map((product, idx) => (
                                  <Box key={idx} sx={{ mb: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                      <Typography variant="body2">{product.productName}</Typography>
                                      <Typography variant="body2">{product.percentage.toFixed(1)}%</Typography>
                                    </Box>
                                    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 8, overflow: 'hidden' }}>
                                      <Box
                                          sx={{
                                            width: `${product.percentage}%`,
                                            bgcolor: idx % 3 === 0 ? 'error.main' :
                                                idx % 3 === 1 ? 'warning.main' : 'info.main',
                                            height: 8
                                          }}
                                      />
                                    </Box>
                                  </Box>
                              ))}
                              {stat.products.length > 5 && (
                                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
                                    외 {stat.products.length - 5}개 제품
                                  </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          원인별 불량 통계 데이터가 없습니다.
                        </Typography>
                      </Paper>
                    </Grid>
                )}
              </Grid>
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
              • 불량조회 화면에서는 생산 과정에서 발생한 불량 정보를 조회하고 분석할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시, 생산실적, 제품, 불량유형 등의 다양한 조건으로 검색이 가능합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 불량 통계 탭에서는 제품별, 원인별 불량 현황을 분석하여 품질 개선에 활용할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 주요 통계 정보를 통해 불량 발생 패턴을 파악하고 품질 향상을 위한 조치를 취할 수 있습니다.
            </Typography>
          </Stack>
        </Box>

        {/* 불량 상세 정보 모달 */}
        <Dialog
            open={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
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
                        value={
                          selectedDefect.state === 'NEW' ? '신규' :
                              selectedDefect.state === 'PROCESSING' ? '처리중' :
                                  selectedDefect.state === 'COMPLETED' ? '완료됨' :
                                      selectedDefect.state || ''
                        }
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
                        value={selectedDefect.createDate ? format(new Date(selectedDefect.createDate), 'yyyy-MM-dd HH:mm') : ''}
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
                        value={selectedDefect.updateDate ? format(new Date(selectedDefect.updateDate), 'yyyy-MM-dd HH:mm') : ''}
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
            <Button onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="불량조회 도움말"
        >
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 불량조회에서는 제품별, 공정별 불량 발생 현황을 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 작업지시ID, 생산실적ID, 제품ID, 불량유형, 등록일자 등 다양한 조건으로 검색할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 상세보기를 통해 불량의 세부 정보를 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 불량 통계 탭에서는 제품별, 원인별 불량 발생 현황을 시각적으로 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 불량 분석 기능을 활용하여 품질 관리 및 개선 활동을 지원합니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default DefectInquiry;
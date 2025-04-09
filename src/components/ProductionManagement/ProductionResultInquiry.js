import React, {useState, useEffect, useCallback, useMemo} from 'react';
import './ProductionResultInquiry.css';
import {useForm, Controller} from 'react-hook-form';
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
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Button
} from '@mui/material';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import {EnhancedDataGridWrapper, SearchCondition} from '../Common';
import {useDomain, DOMAINS} from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import DateRangePicker from '../Common/DateRangePicker';
import {format} from 'date-fns';
import Message from '../../utils/message/Message';
import ko from "date-fns/locale/ko";
import {useGridUtils} from '../../utils/grid/useGridUtils';
import {useGraphQL} from "../../apollo/useGraphQL";
import {gql} from '@apollo/client';

/**
 * 생산실적조회 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionResultInquiry = (props) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const {domain} = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const {loginUser} = useLocalStorageVO();

  // React Hook Form 설정
  const {control, handleSubmit, reset, getValues, setValue} = useForm({
    defaultValues: {
      prodResultId: '',
      workOrderId: '',
      productId: '',
      status: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [productionList, setProductionList] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [productionDetail, setProductionDetail] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [defectList, setDefectList] = useState([]);
  const [statisticsData, setStatisticsData] = useState({
    totalPlanQty: 0,
    totalGoodQty: 0,
    totalDefectQty: 0,
    achievementRate: '0.0',
    defectRate: '0.0',
    dailyStats: [],
    productStats: []
  });

  // 그리드 유틸리티 훅 사용
  const {formatDateToYYYYMMDD} = useGridUtils();

  // GraphQL 훅 사용
  const {executeQuery} = useGraphQL();

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

  // GraphQL 쿼리 정의
  const PRODUCTION_RESULT_LIST_QUERY = gql`
      query getProductionResultList($filter: ProductionResultInquiryFilter) {
          productionResultList(filter: $filter) {
              id
              prodResultId
              workOrderId
              productId
              productName
              equipmentId
              equipmentName
              productionDate
              planQuantity
              actualQuantity
              defectQuantity
              progressRate
              defectRate
              worker
              status
              createDate
              updateDate
          }
      }
  `;

  const PRODUCTION_RESULT_DETAIL_QUERY = gql`
      query getProductionResultDetail($prodResultId: String!) {
          productionResultDetail(prodResultId: $prodResultId) {
              id
              prodResultId
              workOrderId
              productId
              productName
              factoryId
              factoryName
              lineId
              lineName
              equipmentId
              equipmentName
              productionDate
              planQuantity
              goodQuantity
              defectQuantity
              inputAmount
              outputAmount
              yieldRate
              productionTime
              startTime
              endTime
              worker
              supervisor
              progressRate
              defectRate
              status
              defectCause
              resultInfo
              createDate
              updateDate
              createUser
              updateUser
          }
      }
  `;

  const PRODUCTION_RESULT_STATISTICS_QUERY = gql`
      query getProductionResultStatistics($fromDate: String!, $toDate: String!) {
          productionResultStatistics(fromDate: $fromDate, toDate: $toDate) {
              fromDate
              toDate
              totalPlanQty
              totalGoodQty
              totalDefectQty
              achievementRate
              defectRate
              dailyStats {
                  date
                  planQty
                  goodQty
                  defectQty
              }
              productStats {
                  productId
                  productName
                  planQty
                  goodQty
                  defectQty
              }
          }
      }
  `;

  // 생산실적 목록 데이터 포맷 함수
  const formatProductionListData = useCallback((data) => {
    if (!data?.productionResultList) {
      return [];
    }

    return data.productionResultList.map((result) => ({
      ...result,
      id: result.prodResultId,
      planQuantity: result.planQuantity ? Number(result.planQuantity) : 0,
      actualQuantity: result.actualQuantity ? Number(result.actualQuantity) : 0,
      defectQuantity: result.defectQuantity ? Number(result.defectQuantity) : 0,
      createDate: result.createDate ? new Date(result.createDate) : null,
      updateDate: result.updateDate ? new Date(result.updateDate) : null
    }));
  }, []);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      prodResultId: '',
      workOrderId: '',
      productId: '',
      status: '',
      equipmentId: '',
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
    setSelectedProduction(null);
    setProductionDetail(null);
    setDefectList([]);

    // 날짜 형식 변환 - null 값도 허용
    const filterData = {...data};

    // dateRange 객체에서 시작일, 종료일 범위를 추출하여 필터 데이터로 변환
    if (filterData.dateRange) {
      if (filterData.dateRange.startDate) {
        try {
          filterData.fromDate = format(filterData.dateRange.startDate,
              'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.fromDate = null;
        }
      }

      if (filterData.dateRange.endDate) {
        try {
          filterData.toDate = format(filterData.dateRange.endDate,
              'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.toDate = null;
        }
      }

      // dateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.dateRange;
    }

    // 생산실적 검색
    executeQuery(
        {query: PRODUCTION_RESULT_LIST_QUERY, variables: {filter: filterData}}
    )
    .then(response => {
      if (response.data) {
        const formattedData = formatProductionListData(response.data);
        setProductionList(formattedData);
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching production results:", error);
      Message.showError({message: '데이터를 불러오는데 실패했습니다.'});
      setIsLoading(false);
      setProductionList([]);
    });

    // 통계 정보 가져오기 (날짜 필터가 있을 때만)
    if (filterData.fromDate && filterData.toDate) {
      executeQuery({
        query: PRODUCTION_RESULT_STATISTICS_QUERY,
        variables: {
          fromDate: filterData.fromDate,
          toDate: filterData.toDate
        }
      })
      .then(response => {
        if (response.data && response.data.productionResultStatistics) {
          setStatisticsData(response.data.productionResultStatistics);
        }
      })
      .catch(error => {
        console.error("Error fetching statistics:", error);
        // 에러 처리를 하더라도 메인 그리드 로딩에는 영향을 주지 않도록 함
      });
    }
  }, [executeQuery, PRODUCTION_RESULT_LIST_QUERY,
    PRODUCTION_RESULT_STATISTICS_QUERY, formatProductionListData]);

  // 생산실적 선택 핸들러
  const handleProductionSelect = useCallback((params) => {
    const production = productionList.find(p => p.id === params.id);
    setSelectedProduction(production);

    if (production && production.prodResultId) {
      // 선택한 생산실적의 상세 정보 조회
      executeQuery(
          {
            query: PRODUCTION_RESULT_DETAIL_QUERY,
            variables: {prodResultId: production.prodResultId}
          }
      )
      .then(response => {
        if (response.data && response.data.productionResultDetail) {
          setProductionDetail(response.data.productionResultDetail);

          // 불량정보는 별도 API로 조회하거나 임시로 초기화
          // 실제로는 별도 API 호출 필요
          if (response.data.productionResultDetail.defectQuantity > 0) {
            // 임시 불량 데이터 (실제 구현에서는 API 호출)
            setDefectList([
              {
                defectId: `DEF_${Date.now().toString().substring(6)}_1`,
                defectName: '치수불량',
                defectQty: Math.floor(
                    response.data.productionResultDetail.defectQuantity * 0.6),
                defectCause: '규격 초과',
                state: 'PROCESSING'
              },
              {
                defectId: `DEF_${Date.now().toString().substring(6)}_2`,
                defectName: '표면불량',
                defectQty: Math.floor(
                    response.data.productionResultDetail.defectQuantity * 0.4),
                defectCause: '스크래치',
                state: 'COMPLETED'
              }
            ]);
          } else {
            setDefectList([]);
          }
        } else {
          setProductionDetail(null);
          setDefectList([]);
        }
      })
      .catch(error => {
        console.error("Error fetching production detail:", error);
        Message.showError({message: '상세 정보를 불러오는데 실패했습니다.'});
        setProductionDetail(null);
        setDefectList([]);
      });
    } else {
      setProductionDetail(null);
      setDefectList([]);
    }
  }, [productionList, executeQuery, PRODUCTION_RESULT_DETAIL_QUERY]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    if (!selectedProduction) {
      Message.showWarning('출력할 생산실적을 선택해주세요.');
      return;
    }

    Message.showSuccess('생산실적 정보가 인쇄됩니다.');
    // 실제 인쇄 기능 구현 필요
  }, [selectedProduction]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (productionList.length === 0) {
      Message.showWarning('내보낼 데이터가 없습니다.');
      return;
    }

    Message.showSuccess('생산실적 데이터가 엑셀로 내보내집니다.');
    // 실제 엑셀 내보내기 기능 구현 필요
  }, [productionList]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        // 기본 날짜 범위 설정 (오늘부터 1주일)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        if (isMounted) {
          // 폼 상태 업데이트
          setValue('dateRange', {startDate, endDate});

          // 직접 API 호출
          setIsLoading(true);

          // 날짜 형식 변환
          const fromDate = format(startDate, 'yyyy-MM-dd');
          const toDate = format(endDate, 'yyyy-MM-dd');

          // 생산실적 검색 API 호출
          const response = await executeQuery({
            query: PRODUCTION_RESULT_LIST_QUERY,
            variables: {
              filter: {
                fromDate,
                toDate
              }
            }
          });

          if (response.data && isMounted) {
            const formattedData = formatProductionListData(response.data);
            setProductionList(formattedData);
            setRefreshKey(prev => prev + 1);
          }

          // 통계 정보 가져오기
          const statsResponse = await executeQuery({
            query: PRODUCTION_RESULT_STATISTICS_QUERY,
            variables: {
              fromDate,
              toDate
            }
          });

          if (statsResponse.data && statsResponse.data.productionResultStatistics && isMounted) {
            setStatisticsData(statsResponse.data.productionResultStatistics);
          }

          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (isMounted) {
          Message.showError({message: '데이터를 불러오는데 실패했습니다.'});
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      if (isMounted) {
        fetchInitialData();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // 빈 의존성 배열

  // 설비 목록 - 실제로는 API에서 가져와야 함
  const equipmentOptions = useMemo(() => [
    {value: 'EQ001', label: '생산라인 1호기'},
    {value: 'EQ002', label: '생산라인 2호기'},
    {value: 'EQ003', label: '생산라인 3호기'},
    {value: 'EQ004', label: '조립라인 1호기'},
    {value: 'EQ005', label: '조립라인 2호기'}
  ], []);

  // 상태 옵션
  const statusOptions = useMemo(() => [
    {value: 'PLANNED', label: '계획됨'},
    {value: 'IN_PROGRESS', label: '진행중'},
    {value: 'COMPLETED', label: '완료됨'},
    {value: 'CANCELED', label: '취소됨'}
  ], []);

  // 생산실적 목록 그리드 컬럼 정의
  const productionColumns = useMemo(() => ([
    {
      field: 'prodResultId',
      headerName: '생산실적ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
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
      field: 'equipmentName',
      headerName: '설비명',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productionDate',
      headerName: '생산일자',
      width: 110,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'planQuantity',
      headerName: '계획수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'actualQuantity',
      headerName: '양품수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'defectQuantity',
      headerName: '불량수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2"
                      className={params.value > 0 ? "defect-highlight" : ""}>
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'progressRate',
      headerName: '진척률',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? `${params.value}%` : '0%'}
          </Typography>
      )
    },
    {
      field: 'defectRate',
      headerName: '불량률',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2" className={Number(params.value) > 5
              ? "defect-rate-warning" : ""}>
            {params.value ? `${params.value}%` : '0%'}
          </Typography>
      )
    },
    {
      field: 'worker',
      headerName: '작업자',
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let label;
        let className;

        switch (params.value) {
          case 'PLANNED':
            label = '계획됨';
            className = 'status-planned';
            break;
          case 'IN_PROGRESS':
            label = '진행중';
            className = 'status-inprogress';
            break;
          case 'COMPLETED':
            label = '완료됨';
            className = 'status-completed';
            break;
          case 'CANCELED':
            label = '취소됨';
            className = 'status-canceled';
            break;
          default:
            label = params.value;
            className = '';
        }

        return (
            <Typography variant="body2" className={className}>
              {label}
            </Typography>
        );
      }
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    }
  ]), []);

  // 생산실적 목록 그리드 버튼
  const productionGridButtons = useMemo(() => ([
    {label: '출력', onClick: handlePrint, icon: <PrintIcon/>},
    {label: '엑셀', onClick: handleExport, icon: <FileDownloadIcon/>}
  ]), [handlePrint, handleExport]);

  return (
      <Box sx={{p: 0, minHeight: '100vh'}}>
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
                color: isDarkMode ? theme.palette.primary.light
                    : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.light, 0.1)
                      : alpha(theme.palette.primary.main, 0.05)
                }
              }}
          >
            <HelpOutlineIcon/>
          </IconButton>
        </Box>

        {/* 검색 조건 영역 */}
        <SearchCondition
            onSearch={handleSubmit(handleSearch)}
            onReset={handleReset}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="prodResultId"
                control={control}
                render={({field}) => (
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
                name="workOrderId"
                control={control}
                render={({field}) => (
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
                name="productId"
                control={control}
                render={({field}) => (
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
                name="status"
                control={control}
                render={({field}) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="status-label">상태</InputLabel>
                      <Select
                          {...field}
                          labelId="status-label"
                          label="상태"
                      >
                        <MenuItem value="">전체</MenuItem>
                        {statusOptions.map(option => (
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
                name="equipmentId"
                control={control}
                render={({field}) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="equipment-label">설비</InputLabel>
                      <Select
                          {...field}
                          labelId="equipment-label"
                          label="설비"
                      >
                        <MenuItem value="">전체</MenuItem>
                        {equipmentOptions.map(option => (
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
            <LocalizationProvider dateAdapter={AdapterDateFns}
                                  adapterLocale={ko}>
              <Controller
                  name="dateRange"
                  control={control}
                  render={({field}) => (
                      <DateRangePicker
                          startDate={field.value.startDate}
                          endDate={field.value.endDate}
                          onRangeChange={handleDateRangeChange}
                          startLabel="시작일"
                          endLabel="종료일"
                          label="생산일자"
                          size="small"
                      />
                  )}
              />
            </LocalizationProvider>
          </Grid>
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <>
              <Box sx={{mb: 2}}>
                <EnhancedDataGridWrapper
                    title="생산실적 목록"
                    key={refreshKey}
                    rows={productionList}
                    columns={productionColumns}
                    buttons={productionGridButtons}
                    height={400}
                    onRowClick={handleProductionSelect}
                    tabId={props.tabId + "-production-results"}
                />
              </Box>
              <Box sx={{
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 1
              }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="fullWidth"
                >
                  <Tab icon={<SearchIcon/>} label="상세정보"/>
                  <Tab icon={<AnalyticsIcon/>} label="통계정보"/>
                </Tabs>

                {/* 상세정보 탭 */}
                {tabValue === 0 && (
                    <Box sx={{p: 2}}>
                      {productionDetail ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom>
                                생산실적 상세정보 - {productionDetail.prodResultId}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="생산실적ID"
                                  value={productionDetail.prodResultId || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="작업지시ID"
                                  value={productionDetail.workOrderId || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="제품ID"
                                  value={productionDetail.productId || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="제품명"
                                  value={productionDetail.productName || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>

                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="공장"
                                  value={productionDetail.factoryName || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="라인"
                                  value={productionDetail.lineName || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="설비ID"
                                  value={productionDetail.equipmentId || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="설비명"
                                  value={productionDetail.equipmentName || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>

                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="생산일자"
                                  value={productionDetail.productionDate || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="시작시간"
                                  value={productionDetail.startTime || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="종료시간"
                                  value={productionDetail.endTime || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="생산시간"
                                  value={productionDetail.productionTime || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>

                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="계획수량"
                                  value={(productionDetail.planQuantity
                                      || 0).toLocaleString()}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="양품수량"
                                  value={(productionDetail.goodQuantity
                                      || 0).toLocaleString()}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="불량수량"
                                  value={(productionDetail.defectQuantity
                                      || 0).toLocaleString()}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="수율"
                                  value={`${productionDetail.yieldRate
                                  || '0.0'}%`}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>

                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="투입량"
                                  value={(productionDetail.inputAmount
                                      || 0).toLocaleString()}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="산출량"
                                  value={(productionDetail.outputAmount
                                      || 0).toLocaleString()}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="작업자"
                                  value={productionDetail.worker || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} lg={3}>
                              <TextField
                                  label="관리자"
                                  value={productionDetail.supervisor || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                  label="불량 원인"
                                  value={productionDetail.defectCause || ''}
                                  fullWidth
                                  size="small"
                                  margin="dense"
                                  multiline
                                  rows={2}
                                  InputProps={{readOnly: true}}
                              />
                            </Grid>

                            {/* 불량정보 목록 */}
                            {defectList.length > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle1" gutterBottom
                                              sx={{mt: 1}}>
                                    불량정보 목록
                                  </Typography>
                                  <Paper variant="outlined" sx={{p: 1}}>
                                    <Grid container spacing={1}>
                                      {defectList.map((defect, index) => (
                                          <Grid item xs={12} sm={6} md={4}
                                                key={defect.defectId}>
                                            <Card variant="outlined">
                                              <CardContent sx={{
                                                p: 1,
                                                '&:last-child': {pb: 1}
                                              }}>
                                                <Grid container spacing={1}>
                                                  <Grid item xs={6}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary">불량유형</Typography>
                                                    <Typography
                                                        variant="body2">{defect.defectName}</Typography>
                                                  </Grid>
                                                  <Grid item xs={6}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary">수량</Typography>
                                                    <Typography
                                                        variant="body2">{defect.defectQty}</Typography>
                                                  </Grid>
                                                  <Grid item xs={12}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary">불량원인</Typography>
                                                    <Typography
                                                        variant="body2">{defect.defectCause}</Typography>
                                                  </Grid>
                                                  <Grid item xs={12}>
                                                    <Box sx={{
                                                      display: 'flex',
                                                      justifyContent: 'flex-end',
                                                      mt: 1
                                                    }}>
                                                      <Chip
                                                          label={defect.state
                                                          === 'NEW' ? '신규' :
                                                              defect.state
                                                              === 'PROCESSING'
                                                                  ? '처리중'
                                                                  : '완료'}
                                                          size="small"
                                                          color={defect.state
                                                          === 'NEW' ? 'primary'
                                                              :
                                                              defect.state
                                                              === 'PROCESSING'
                                                                  ? 'warning'
                                                                  : 'success'}
                                                      />
                                                    </Box>
                                                  </Grid>
                                                </Grid>
                                              </CardContent>
                                            </Card>
                                          </Grid>
                                      ))}
                                    </Grid>
                                  </Paper>
                                </Grid>
                            )}
                          </Grid>
                      ) : (
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px'
                          }}>
                            <Typography variant="body1" color="text.secondary">
                              생산실적을 선택하여 상세 정보를 확인하세요.
                            </Typography>
                          </Box>
                      )}
                    </Box>
                )}

                {/* 통계정보 탭 */}
                {tabValue === 1 && (
                    <Box sx={{p: 2}}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="h6" gutterBottom>
                            생산실적 통계정보
                          </Typography>
                        </Grid>

                        {/* 주요 통계 지표 */}
                        <Grid item xs={12} md={3}>
                          <Paper
                              elevation={0}
                              variant="outlined"
                              sx={{
                                p: 2,
                                textAlign: 'center',
                                backgroundColor: alpha(
                                    theme.palette.primary.main, 0.05)
                              }}
                          >
                            <Typography variant="subtitle2"
                                        color="text.secondary">계획
                              수량</Typography>
                            <Typography variant="h5" sx={{mt: 1}}>
                              {(statisticsData.totalPlanQty
                                  || 0).toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Paper
                              elevation={0}
                              variant="outlined"
                              sx={{
                                p: 2,
                                textAlign: 'center',
                                backgroundColor: alpha(
                                    theme.palette.success.main, 0.05)
                              }}
                          >
                            <Typography variant="subtitle2"
                                        color="text.secondary">양품
                              수량</Typography>
                            <Typography variant="h5" sx={{mt: 1}}>
                              {(statisticsData.totalGoodQty
                                  || 0).toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Paper
                              elevation={0}
                              variant="outlined"
                              sx={{
                                p: 2,
                                textAlign: 'center',
                                backgroundColor: alpha(theme.palette.error.main,
                                    0.05)
                              }}
                          >
                            <Typography variant="subtitle2"
                                        color="text.secondary">불량
                              수량</Typography>
                            <Typography variant="h5" sx={{mt: 1}}>
                              {(statisticsData.totalDefectQty
                                  || 0).toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Paper
                              elevation={0}
                              variant="outlined"
                              sx={{
                                p: 2,
                                textAlign: 'center',
                                backgroundColor: alpha(theme.palette.info.main,
                                    0.05)
                              }}
                          >
                            <Typography variant="subtitle2"
                                        color="text.secondary">불량률</Typography>
                            <Typography variant="h5" sx={{mt: 1}}>
                              {statisticsData.defectRate || '0.0'}%
                            </Typography>
                          </Paper>
                        </Grid>

                        {/* 통계 탭 영역 */}
                        <Grid item xs={12}>
                          <Box sx={{
                            mt: 1,
                            borderBottom: 1,
                            borderColor: 'divider'
                          }}>
                            <Tabs
                                value={0}
                                aria-label="statistics tabs"
                                textColor="primary"
                                indicatorColor="primary"
                            >
                              <Tab icon={<BarChartIcon/>} label="일별 생산현황"/>
                              <Tab icon={<PieChartIcon/>} label="제품별 생산현황"
                                   disabled/>
                            </Tabs>
                          </Box>
                        </Grid>

                        {/* 일별 통계 테이블 */}
                        <Grid item xs={12}>
                          <Paper variant="outlined" sx={{mt: 1}}>
                            <Box sx={{overflowX: 'auto'}}>
                              <Box sx={{
                                minWidth: 650,
                                p: 1,
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  기간별 생산현황
                                </Typography>
                                <Divider sx={{mb: 2}}/>

                                {statisticsData.dailyStats
                                && statisticsData.dailyStats.length > 0 ? (
                                    <table style={{
                                      width: '100%',
                                      borderCollapse: 'collapse'
                                    }}>
                                      <thead>
                                      <tr>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>날짜
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>계획수량
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>양품수량
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>불량수량
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>달성률
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>불량률
                                        </th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      {statisticsData.dailyStats.map(
                                          (stat, index) => {
                                            const totalQty = (stat.goodQty || 0)
                                                + (stat.defectQty || 0);
                                            const achievementRate = stat.planQty
                                            > 0 ? ((stat.goodQty / stat.planQty)
                                                * 100).toFixed(1) : '0.0';
                                            const defectRate = totalQty > 0
                                                ? ((stat.defectQty / totalQty)
                                                    * 100).toFixed(1) : '0.0';

                                            return (
                                                <tr key={index}>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{stat.date}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{(stat.planQty
                                                      || 0).toLocaleString()}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{(stat.goodQty
                                                      || 0).toLocaleString()}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{(stat.defectQty
                                                      || 0).toLocaleString()}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{achievementRate}%
                                                  </td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{defectRate}%
                                                  </td>
                                                </tr>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                ) : (
                                    <Box sx={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: '100px'
                                    }}>
                                      <Typography variant="body2"
                                                  color="text.secondary">
                                        일별 통계 데이터가 없습니다.
                                      </Typography>
                                    </Box>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>

                        {/* 제품별 통계 테이블 */}
                        <Grid item xs={12}>
                          <Paper variant="outlined" sx={{mt: 1}}>
                            <Box sx={{overflowX: 'auto'}}>
                              <Box sx={{
                                minWidth: 650,
                                p: 1,
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  제품별 생산현황
                                </Typography>
                                <Divider sx={{mb: 2}}/>

                                {statisticsData.productStats
                                && statisticsData.productStats.length > 0 ? (
                                    <table style={{
                                      width: '100%',
                                      borderCollapse: 'collapse'
                                    }}>
                                      <thead>
                                      <tr>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>제품ID
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>제품명
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>계획수량
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>양품수량
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>불량수량
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>달성률
                                        </th>
                                        <th style={{
                                          padding: '8px',
                                          borderBottom: '1px solid #e0e0e0',
                                          textAlign: 'center'
                                        }}>불량률
                                        </th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      {statisticsData.productStats.map(
                                          (stat, index) => {
                                            const totalQty = (stat.goodQty || 0)
                                                + (stat.defectQty || 0);
                                            const achievementRate = stat.planQty
                                            > 0 ? ((stat.goodQty / stat.planQty)
                                                * 100).toFixed(1) : '0.0';
                                            const defectRate = totalQty > 0
                                                ? ((stat.defectQty / totalQty)
                                                    * 100).toFixed(1) : '0.0';

                                            return (
                                                <tr key={index}>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{stat.productId}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{stat.productName}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{(stat.planQty
                                                      || 0).toLocaleString()}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{(stat.goodQty
                                                      || 0).toLocaleString()}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{(stat.defectQty
                                                      || 0).toLocaleString()}</td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{achievementRate}%
                                                  </td>
                                                  <td style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    textAlign: 'center'
                                                  }}>{defectRate}%
                                                  </td>
                                                </tr>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                ) : (
                                    <Box sx={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: '100px'
                                    }}>
                                      <Typography variant="body2"
                                                  color="text.secondary">
                                        제품별 통계 데이터가 없습니다.
                                      </Typography>
                                    </Box>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                )}
              </Box>
            </>
        )}

        {/* 하단 정보 영역 */}
        <Box mt={2} p={2} sx={{
          bgcolor: getBgColor(),
          borderRadius: 1,
          border: `1px solid ${getBorderColor()}`
        }}>
          <Stack spacing={1}>
            <Typography variant="body2" color={getTextColor()}>
              • 생산실적조회 화면에서는 등록된 생산실적을 조회하고 분석할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 생산일자, 제품, 작업지시 등의 조건으로 검색이 가능합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 통계정보 탭에서는 일별, 제품별 생산현황을 확인할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 출력 버튼을 통해 생산실적을 인쇄하거나, 엑셀 버튼을 통해 데이터를 내보낼 수 있습니다.
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
            • 상세정보 탭에서는 선택한 생산실적의 자세한 정보를 확인할 수 있으며, 불량정보도 함께 표시됩니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 통계정보 탭에서는 기간별 생산 현황과 제품별 생산 현황을 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()} paragraph>
            • 출력 및 엑셀 버튼을 통해 데이터를 외부로 내보낼 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default ProductionResultInquiry;
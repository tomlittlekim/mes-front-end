import React, { useState, useEffect } from 'react';
import StatCardContainer from './StatCardContainer';
import KpiChart from '../components/Dashboard/KpiChart';
import ApiStatus from '../components/Dashboard/ApiStatus';
import KpiFilter from '../components/Dashboard/KpiFilter';
import { Grid, Box, Card, CardContent, useTheme, CircularProgress, Typography } from '@mui/material';
import { useDomain, DOMAINS } from '../contexts/DomainContext';
import IotChart from "../components/Charts/IotChart";
import { useGraphQL } from '../apollo/useGraphQL';
import { GET_SUBSCRIBED_KPI_DATA, GET_KPI_CHART_DATA } from '../graphql-queries/KPI/queries';

// Dashboard 컨테이너 컴포넌트
const DashboardContainer = () => {
  // 상태 관리
  const [kpiData, setKpiData] = useState([]);
  const [isKpiLoading, setIsKpiLoading] = useState(true);
  
  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // KPI 지표별 필터 상태
  const [indicatorFilters, setIndicatorFilters] = useState({});
  
  // 기본 필터 (처음 로드 시 사용)
  const [defaultFilter] = useState({
    date: getTodayFormatted(),
    range: 'week' // 기본값으로 주간 데이터
  });
  
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery } = useGraphQL();
  
  // 도메인별 배경색 가져오기
  const getCardBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2d1e0f' : '#ffffff';
    }
    return isDarkMode ? '#102a43' : '#ffffff';
  };
  
  // 도메인별 테두리 색상 가져오기
  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#2d4764' : '#e0e0e0';
  };

  // 단일 KPI 데이터 로드
  const loadSingleKpiData = async (kpiIndicatorCd, filter) => {
    try {
      // 현재 모든 지표 가져오기
      const allFilters = { ...indicatorFilters };
      
      // 특정 지표의 필터 업데이트
      allFilters[kpiIndicatorCd] = filter;
      
      // 필터가 있는 모든 지표에 대한 indicatorFilters 구성
      const activeFilters = Object.entries(allFilters)
        .map(([code, filterData]) => ({
          kpiIndicatorCd: code,
          date: filterData.date,
          range: filterData.range
        }));
      
      // KPI 차트 데이터 요청 구성
      const request = {
        defaultFilter: defaultFilter,
        indicatorFilters: activeFilters
      };
      
      console.log('KPI 필터 요청:', JSON.stringify(request, null, 2));
      
      // GraphQL 쿼리 실행
      const result = await executeQuery(GET_KPI_CHART_DATA, { request });
      
      if (result?.data?.getKpiChartData) {
        // 받은 데이터로 전체 KPI 데이터 업데이트
        setKpiData(result.data.getKpiChartData);
      }
    } catch (error) {
      console.error(`KPI 데이터 로드 중 오류 발생 (${kpiIndicatorCd}):`, error);
      
      // 오류 발생 시 기존 API로 폴백
      try {
        const result = await executeQuery(GET_SUBSCRIBED_KPI_DATA, {
          filter: defaultFilter
        });
        
        if (result?.data?.getSubscribedKpiData) {
          setKpiData(result.data.getSubscribedKpiData);
        }
      } catch (fallbackError) {
        console.error('폴백 API 호출 중 오류 발생:', fallbackError);
      }
    }
  };

  // 모든 KPI 데이터 로드
  const loadAllKpiData = async () => {
    setIsKpiLoading(true);
    try {
      // 초기에는 기존 API로 구독 중인 KPI 지표 목록 가져오기
      const result = await executeQuery(GET_SUBSCRIBED_KPI_DATA, {
        filter: defaultFilter
      });
      
      if (result?.data?.getSubscribedKpiData) {
        const subscribedData = result.data.getSubscribedKpiData;
        
        // 지표별 초기 필터 설정
        const initialFilters = {};
        subscribedData.forEach(item => {
          initialFilters[item.kpiIndicatorCd] = {
            date: defaultFilter.date,
            range: defaultFilter.range
          };
        });
        setIndicatorFilters(initialFilters);
        
        // 새로운 API 사용해서 모든 지표 데이터 한번에 로드
        try {
          const indicatorFiltersList = subscribedData.map(item => ({
            kpiIndicatorCd: item.kpiIndicatorCd,
            date: defaultFilter.date,
            range: defaultFilter.range
          }));
          
          const chartResult = await executeQuery(GET_KPI_CHART_DATA, {
            request: {
              defaultFilter: defaultFilter,
              indicatorFilters: indicatorFiltersList
            }
          });
          
          if (chartResult?.data?.getKpiChartData) {
            setKpiData(chartResult.data.getKpiChartData);
          } else {
            // 새 API 실패시 기존 데이터 사용
            setKpiData(subscribedData);
          }
        } catch (chartError) {
          console.error('KPI 차트 데이터 로드 중 오류 발생:', chartError);
          // 새 API 실패시 기존 데이터 사용
          setKpiData(subscribedData);
        }
      }
    } catch (error) {
      console.error('KPI 데이터 로드 중 오류 발생:', error);
      setKpiData([]);
    } finally {
      setIsKpiLoading(false);
    }
  };

  // 처음 로드 시 모든 KPI 데이터 가져오기
  useEffect(() => {
    loadAllKpiData();
    
    // 1분마다 모든 데이터 자동 갱신
    const intervalId = setInterval(() => {
      // 각 차트별 현재 필터 설정으로 데이터 새로고침
      kpiData.forEach(item => {
        const filter = indicatorFilters[item.kpiIndicatorCd] || defaultFilter;
        loadSingleKpiData(item.kpiIndicatorCd, filter);
      });
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 개별 차트 필터 변경 핸들러
  const handleChartFilterChange = (kpiIndicatorCd, newFilter, refresh = false) => {
    // 필터 상태 업데이트
    setIndicatorFilters(prev => ({
      ...prev,
      [kpiIndicatorCd]: newFilter
    }));
    
    // 필터 변경 즉시 데이터 새로고침 요청이 있으면 로드
    if (refresh) {
      loadSingleKpiData(kpiIndicatorCd, newFilter);
    }
  };

  // 모든 데이터 새로고침 핸들러
  const handleRefreshAll = () => {
    kpiData.forEach(item => {
      const filter = indicatorFilters[item.kpiIndicatorCd] || defaultFilter;
      loadSingleKpiData(item.kpiIndicatorCd, filter);
    });
  };

  // 대시보드 데이터
  const dashboardData = {
    stats: {
      production: {
        value: '85.7%',
        trend: '3.2%',
        status: 'up'
      },
      quality: {
        value: '98.2%',
        trend: '1.7%',
        status: 'up'
      },
      inventory: {
        value: '12,834',
        trend: '2.4%',
        status: 'down'
      },
      equipment: {
        value: '95.3%',
        trend: '0.5%',
        status: 'up'
      }
    },
    apiStatus: {
      mainEquipment: 'online',
      assemblyLine: 'online',
      packagingSystem: 'online',
      qualityControl: 'online'
    }
  };

  // KPI 차트 렌더링
  const renderKpiCharts = () => {
    if (isKpiLoading) {
      return (
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`,
            height: '100%',
            minHeight: '300px'
          }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              pb: 3,
              '&:last-child': { pb: 3 }
            }}>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      );
    }
    
    if (!kpiData || kpiData.length === 0) {
      return (
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`,
            height: '100%',
            minHeight: '300px'
          }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              pb: 3,
              '&:last-child': { pb: 3 }
            }}>
              <Typography variant="h6" color="text.secondary">
                구독 중인 KPI 데이터가 없습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                KPI 설정에서 관심 있는 지표를 구독해주세요.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    }
    
    // 구독한 KPI 차트들을 표시
    return kpiData.map((data, index) => (
      <Grid item xs={12} md={6} key={`kpi-chart-${data.kpiIndicatorCd || index}`}>
        <Card sx={{ 
          boxShadow: 3,
          bgcolor: getCardBgColor(),
          border: `1px solid ${getBorderColor()}`,
          height: '100%',
          minHeight: '300px'
        }}>
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            pb: 3,
            '&:last-child': { pb: 3 }
          }}>
            <KpiChart 
              kpiData={data} 
              isLoading={false} 
              onFilterChange={handleChartFilterChange}
              filter={indicatorFilters[data.kpiIndicatorCd] || defaultFilter}
            />
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box sx={{ pt: 0, pl: 0, pr: 0, pb: 2 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`
          }}>
            <CardContent sx={{ 
              p: 2,
              pb: 2,
              '&:last-child': { pb: 2 }
            }}>
              <StatCardContainer title="생산 가동률" data={dashboardData.stats.production} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`
          }}>
            <CardContent sx={{ 
              p: 2,
              pb: 2,
              '&:last-child': { pb: 2 }
            }}>
              <StatCardContainer title="품질 양품률" data={dashboardData.stats.quality} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`
          }}>
            <CardContent sx={{ 
              p: 2,
              pb: 2,
              '&:last-child': { pb: 2 }
            }}>
              <StatCardContainer title="재고 현황" data={dashboardData.stats.inventory} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`
          }}>
            <CardContent sx={{ 
              p: 2,
              pb: 2,
              '&:last-child': { pb: 2 }
            }}>
              <StatCardContainer title="설비 가동률" data={dashboardData.stats.equipment} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 동적으로 KPI 차트 렌더링 */}
        {renderKpiCharts()}
        
        {/* 기존 IotChart 표시 */}
        <Grid item xs={12} md={6}>
          <IotChart/>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`
          }}>
            <CardContent sx={{ 
              p: 2,
              pb: 3,
              '&:last-child': { pb: 3 }
            }}>
              <ApiStatus status={dashboardData.apiStatus} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContainer;
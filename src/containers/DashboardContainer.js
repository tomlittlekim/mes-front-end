import React, { useState, useEffect } from 'react';
import StatCardContainer from './StatCardContainer';
import KpiChart from '../components/Dashboard/KpiChart';
import ApiStatus from '../components/Dashboard/ApiStatus';
import { Grid, Box, Card, CardContent, useTheme, CircularProgress, Typography } from '@mui/material';
import { useDomain, DOMAINS } from '../contexts/DomainContext';
import IotChart from "../components/Charts/IotChart";
import { useGraphQL } from '../apollo/useGraphQL';
import { GET_KPI_CHART_DATA } from '../graphql-queries/KPI/queries';

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

  // 모든 KPI 데이터 로드
  const loadAllKpiData = async () => {
    setIsKpiLoading(true);
    try {
      // 지표별 필터가 있는지 확인
      const hasFilters = Object.keys(indicatorFilters).length > 0;
      
      let filters = [];
      
      if (hasFilters) {
        // 기존 필터 사용 (개별 지표에 대한 필터 설정이 있는 경우)
        filters = Object.entries(indicatorFilters).map(([kpiIndicatorCd, filter]) => ({
          kpiIndicatorCd,
          date: filter.date,
          range: filter.range
        }));
      } else {
        // 초기 로드 시 기본 날짜와 범위로 모든 구독 KPI 데이터 요청
        // 백엔드에서 사용자의 구독 정보를 기반으로 데이터 반환
        const defaultDate = getTodayFormatted();
        const defaultRange = 'week';
        
        filters = [{
          date: defaultDate,
          range: defaultRange
        }];
      }
      
      // GraphQL 쿼리 실행
      const result = await executeQuery(GET_KPI_CHART_DATA, {
        filters: filters
      });
      
      if (result?.data?.getKpiChartData) {
        const newData = result.data.getKpiChartData;
        setKpiData(newData);
        
        // 새로 받은 데이터를 기반으로 필터 상태 업데이트 (초기 로드 시에만)
        if (!hasFilters && newData.length > 0) {
          const defaultDate = getTodayFormatted();
          const defaultRange = 'week';
          
          const initialFilters = {};
          newData.forEach(item => {
            initialFilters[item.kpiIndicatorCd] = {
              date: defaultDate,
              range: defaultRange
            };
          });
          
          setIndicatorFilters(initialFilters);
        }
      } else {
        // 데이터 없음
        setKpiData([]);
      }
    } catch (error) {
      console.error('KPI 데이터 로드 중 오류 발생:', error);
      setKpiData([]);
    } finally {
      setIsKpiLoading(false);
    }
  };

  // 단일 KPI 데이터 로드
  const loadSingleKpiData = async (kpiIndicatorCd, filter) => {
    try {
      // 현재 필터 상태 업데이트
      const updatedFilters = {
        ...indicatorFilters,
        [kpiIndicatorCd]: filter
      };
      
      // 변경된 지표의 필터만 전송
      const filters = [{
        kpiIndicatorCd,
        date: filter.date,
        range: filter.range
      }];
      
      // GraphQL 쿼리 실행
      const result = await executeQuery(GET_KPI_CHART_DATA, {
        filters
      });
      
      if (result?.data?.getKpiChartData) {
        // 새 데이터로 해당 차트만 업데이트
        const newChartData = result.data.getKpiChartData;
        
        setKpiData(prevData => {
          // 해당 차트 데이터만 업데이트하고 나머지는 유지
          if (newChartData.length === 0) return prevData;
          
          return prevData.map(item => {
            const updatedItem = newChartData.find(newItem => 
              newItem.kpiIndicatorCd === item.kpiIndicatorCd
            );
            return updatedItem || item;
          });
        });
        
        // 필터 상태 업데이트
        setIndicatorFilters(updatedFilters);
      }
    } catch (error) {
      console.error(`KPI 데이터 로드 중 오류 발생 (${kpiIndicatorCd}):`, error);
    }
  };

  // 처음 로드 시 모든 KPI 데이터 가져오기
  useEffect(() => {
    loadAllKpiData();
    
    // 1분마다 모든 데이터 자동 갱신
    const intervalId = setInterval(() => {
      loadAllKpiData();
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
              filter={indicatorFilters[data.kpiIndicatorCd] || {
                date: getTodayFormatted(),
                range: 'week'
              }}
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

export default DashboardContainer;
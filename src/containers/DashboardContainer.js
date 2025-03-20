import React from 'react';
import StatCardContainer from './StatCardContainer';
import KpiChart from '../components/Dashboard/KpiChart';
import IotChart from '../components/Dashboard/IotChart';
import ApiStatus from '../components/Dashboard/ApiStatus';
import { Grid, Box, Card, CardContent, useTheme } from '@mui/material';

// 여기서는 실제 API 호출을 대신하여 목업 데이터를 사용합니다
const DashboardContainer = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드 색상 설정
  const darkBlueBackground = '#102a43';
  const darkBorderColor = '#2d4764';

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

  // 실제 환경에서는 여기서 API 데이터를 가져오는 부분이 있을 것입니다
  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff'
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
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff'
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
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff'
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
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff'
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
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff',
            height: '100%'
          }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              pb: 3,
              '&:last-child': { pb: 3 }
            }}>
              <KpiChart />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff',
            height: '100%'
          }}>
            <CardContent sx={{ 
              height: '100%',
              p: 2,
              pb: 3,
              '&:last-child': { pb: 3 }
            }}>
              <IotChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: 3,
            bgcolor: isDarkMode ? darkBlueBackground : '#ffffff'
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
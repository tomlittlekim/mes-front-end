import React, {useState} from 'react';
import {Box, Grid, Typography, Paper, useTheme, alpha, IconButton} from '@mui/material';
import { PowerMonitoringCard, PowerEfficiencyChart, ComparisonChart, usePowerSensorData, usePowerEfficiency } from './';
import {DOMAINS, useDomain} from "../../../contexts/DomainContext";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpModal from "../../Common/HelpModal";

// 통합 모니터링 메인 컴포넌트
const IntegratedMonitoring = ({ tabId }) => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const {domain} = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // 스타일 관련 함수
  const getTextColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)') :
      (isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)');

  const getBgColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)') :
      (isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)');

  const getBorderColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#3d2814' : '#f5e8d7') :
      (isDarkMode ? '#1e3a5f' : '#e0e0e0');

  /** 안내 모달 상태 */
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 전력량 센서 데이터 및 효율 데이터 불러오기
  const powerData = usePowerSensorData();
  const efficiencyData = usePowerEfficiency(powerData);

  // 센서 데이터 준비
  const sensor1 = {
    ...powerData.sensor1,
    trend: efficiencyData.sensor1.trend,
  };

  const sensor2 = {
    ...powerData.sensor2,
    trend: efficiencyData.sensor2.trend,
  };

  return (
    <Box sx={{p: 0, minHeight: '100vh'}}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        borderBottom: `1px solid ${getBorderColor()}`,
        pb: 1
      }}>
        <Typography variant="h5" component="h2"
                    sx={{
                      fontWeight: 600,
                      color: getTextColor()
                    }}>
          통합 전력 모니터링
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
          <HelpOutlineIcon/>
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* 요약 통계 섹션 - 최상단으로 이동 */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              padding: 3, 
              borderRadius: '12px', 
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h6" fontWeight="600" mb={2}>
              전력 모니터링 요약
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    총 전력 사용량
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="primary">
                    {(sensor1.power + sensor2.power).toFixed(1)} W
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    누적 에너지
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="primary">
                    {(sensor1.energy + sensor2.energy).toFixed(2)} kWh
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    센서 1 평균 효율
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="600" 
                    color={efficiencyData.sensor1.efficiency >= 0 ? 'primary' : 'error'}
                  >
                    {efficiencyData.sensor1.efficiency.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    센서 2 평균 효율
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="600" 
                    color={efficiencyData.sensor2.efficiency >= 0 ? 'primary' : 'error'}
                  >
                    {efficiencyData.sensor2.efficiency.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 센서 모니터링 섹션 - 좌우 배치 */}
        <Grid item xs={12} md={6}>
          <PowerMonitoringCard 
            title="센서 1 모니터링" 
            sensorData={sensor1} 
            chartData={powerData.sensor1.history}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PowerMonitoringCard 
            title="센서 2 모니터링" 
            sensorData={sensor2} 
            chartData={powerData.sensor2.history}
          />
        </Grid>

        {/* 차트 섹션 - 좌우 배치 */}
        <Grid item xs={12} md={6}>
          <PowerEfficiencyChart sensorData={efficiencyData} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ComparisonChart 
            sensor1Data={powerData.sensor1.history} 
            sensor2Data={powerData.sensor2.history}
          />
        </Grid>
      </Grid>

      {/* 도움말 모달 */}
      <HelpModal
          open={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          title="통합 전력 모니터링 도움말"
      >
        <Typography variant="subtitle1" color="text.secondary" mt={1}>
          실시간 전력량 및 효율 모니터링 시스템
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default IntegratedMonitoring; 
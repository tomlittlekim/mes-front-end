import React, {useState} from 'react';
import {Box, Grid, Typography, Paper, useTheme, IconButton, alpha} from '@mui/material';
import { KPICard, TrendChart, OverallKPIChart, PowerUsageChart, useEnergyKPIData, useKPIAchievement } from './';
import {DOMAINS, useDomain} from "../../../contexts/DomainContext";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpModal from "../../Common/HelpModal";

// KPI 모니터링 메인 컴포넌트
const KPIMonitoring = ({ tabId }) => {
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

  // KPI 데이터 및 달성률 불러오기
  const kpiData = useEnergyKPIData();
  const kpiAchievement = useKPIAchievement(kpiData);

  // KPI 설명 데이터
  const kpiDescriptions = {
    energyEfficiency: '생산 단위당 전력 사용량 (Wh/unit) - 낮을수록 좋음',
    peakReduction: '최대 전력 사용량 대비 감소율 (%) - 높을수록 좋음',
    standbyPower: '설비 미가동 시 대기 전력량 (W) - 낮을수록 좋음',
    costSavings: '전년 대비 에너지 비용 절감률 (%) - 높을수록 좋음',
    powerQuality: '전력 품질 지수 (%) - 높을수록 좋음',
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
          전력 KPI 모니터링
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
        {/* KPI 카드 섹션 */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <KPICard
                title="에너지 효율"
                current={kpiData.kpis.energyEfficiency.current}
                target={kpiData.kpis.energyEfficiency.target}
                unit="Wh/unit"
                description={kpiDescriptions.energyEfficiency}
                achievementRate={kpiAchievement.byCategory.energyEfficiency}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <KPICard
                title="피크 전력 감소율"
                current={kpiData.kpis.peakReduction.current}
                target={kpiData.kpis.peakReduction.target}
                unit="%"
                description={kpiDescriptions.peakReduction}
                achievementRate={kpiAchievement.byCategory.peakReduction}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <KPICard
                title="대기 전력"
                current={kpiData.kpis.standbyPower.current}
                target={kpiData.kpis.standbyPower.target}
                unit="W"
                description={kpiDescriptions.standbyPower}
                achievementRate={kpiAchievement.byCategory.standbyPower}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <KPICard
                title="비용 절감률"
                current={kpiData.kpis.costSavings.current}
                target={kpiData.kpis.costSavings.target}
                unit="%"
                description={kpiDescriptions.costSavings}
                achievementRate={kpiAchievement.byCategory.costSavings}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <KPICard
                title="전력 품질 지수"
                current={kpiData.kpis.powerQuality.current}
                target={kpiData.kpis.powerQuality.target}
                unit="%"
                description={kpiDescriptions.powerQuality}
                achievementRate={kpiAchievement.byCategory.powerQuality}
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* 전력 사용량 차트 섹션 */}
        <Grid item xs={12} md={8}>
          <PowerUsageChart usageData={kpiData.usage} />
        </Grid>
        
        {/* 종합 KPI 달성률 차트 섹션 */}
        <Grid item xs={12} md={4}>
          <OverallKPIChart kpiAchievement={kpiAchievement} />
        </Grid>
        
        {/* KPI 추세 차트 섹션 */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="600" mb={2}>
            KPI 추세 분석
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TrendChart
                title="에너지 효율 추세"
                data={kpiData.kpis.energyEfficiency.trend}
                dataKey="value"
                unit="Wh/unit"
                target={kpiData.kpis.energyEfficiency.target}
                targetLabel="목표 효율"
                isLowerBetter={true}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TrendChart
                title="피크 전력 감소율 추세"
                data={kpiData.kpis.peakReduction.trend}
                dataKey="value"
                unit="%"
                target={kpiData.kpis.peakReduction.target}
                targetLabel="목표 감소율"
                isLowerBetter={false}
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* 센서 정보 요약 섹션 */}
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
              센서 정보 요약
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="600" width="150px">
                    센서 1:
                  </Typography>
                  <Box>
                    <Typography variant="body2">평균 전력: {kpiData.sensors.sensor1.averagePower.toFixed(1)} W</Typography>
                    <Typography variant="body2">가동율: {kpiData.sensors.sensor1.uptime}%</Typography>
                    <Typography variant="body2">일간 에너지: {kpiData.sensors.sensor1.dailyEnergy} kWh</Typography>
                    <Typography variant="body2">월간 에너지: {kpiData.sensors.sensor1.monthlyEnergy} kWh</Typography>
                    <Typography variant="body2">피크 시간/전력: {kpiData.sensors.sensor1.peakTime} / {kpiData.sensors.sensor1.peakPower} W</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="600" width="150px">
                    센서 2:
                  </Typography>
                  <Box>
                    <Typography variant="body2">평균 전력: {kpiData.sensors.sensor2.averagePower.toFixed(1)} W</Typography>
                    <Typography variant="body2">가동율: {kpiData.sensors.sensor2.uptime}%</Typography>
                    <Typography variant="body2">일간 에너지: {kpiData.sensors.sensor2.dailyEnergy} kWh</Typography>
                    <Typography variant="body2">월간 에너지: {kpiData.sensors.sensor2.monthlyEnergy} kWh</Typography>
                    <Typography variant="body2">피크 시간/전력: {kpiData.sensors.sensor2.peakTime} / {kpiData.sensors.sensor2.peakPower} W</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="전력 KPI 모니터링 도움말"
        >
          <Typography variant="subtitle1" color="text.secondary" mt={1}>
            전력 사용량 및 효율 KPI 지표 모니터링 시스템
          </Typography>
        </HelpModal>

      </Grid>
    </Box>
  );
};

export default KPIMonitoring; 
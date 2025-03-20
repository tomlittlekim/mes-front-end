import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

// 샘플 데이터
const sampleData = [
  { name: '1', 생산성: 40, 품질: 30 },
  { name: '2', 생산성: 25, 품질: 38 },
  { name: '3', 생산성: 30, 품질: 20 },
  { name: '4', 생산성: 45, 품질: 30 },
  { name: '5', 생산성: 50, 품질: 20 },
  { name: '6', 생산성: 20, 품질: 30 },
  { name: '7', 생산성: 55, 품질: 50 },
  { name: '8', 생산성: 30, 품질: 30 },
  { name: '9', 생산성: 50, 품질: 35 },
];

const KpiChart = () => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  const getSecondaryTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(240, 230, 217, 0.7)' : 'rgba(0, 0, 0, 0.6)';
    }
    return isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  };
  
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // 도메인별 차트 색상
  const getProductionColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return '#4caf50';
  };
  
  const getQualityColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f39c12' : '#e74c3c';
    }
    return '#ff5722';
  };
  
  const getTooltipBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#ffffff';
    }
    return isDarkMode ? '#1e3a5f' : '#ffffff';
  };
  
  const getTooltipBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    }
    return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  };

  return (
    <Box sx={{ 
      p: 1,
      color: getTextColor(),
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          KPI 지표
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: getSecondaryTextColor() }}>
          생산성 및 품질 KPI 지표입니다.
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, width: '100%', minHeight: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sampleData}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="name"
              tick={{ fill: getTextColor() }}
            />
            <YAxis 
              tick={{ fill: getTextColor() }}
              domain={[0, 60]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: getTooltipBgColor(),
                borderColor: getTooltipBorderColor(),
                color: getTextColor()
              }}
            />
            <Legend wrapperStyle={{ color: getTextColor() }} />
            <Line
              type="monotone"
              dataKey="생산성"
              stroke={getProductionColor()}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="품질" 
              stroke={getQualityColor()} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default KpiChart; 
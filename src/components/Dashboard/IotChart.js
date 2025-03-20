import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

// 샘플 데이터
const sampleData = [
  { name: '0', 온도: 15, 압력: 30 },
  { name: '1', 온도: 40, 압력: 45 },
  { name: '2', 온도: 25, 압력: 20 },
  { name: '3', 온도: 30, 압력: 15 },
  { name: '4', 온도: 25, 압력: 50 },
  { name: '5', 온도: 50, 압력: 15 },
  { name: '6', 온도: 15, 압력: 45 },
  { name: '7', 온도: 40, 압력: 20 },
  { name: '8', 온도: 25, 압력: 50 },
  { name: '9', 온도: 45, 압력: 30 },
];

const IotChart = () => {
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
  const getTemperatureColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return '#2196f3'; // 파란색
  };
  
  const getPressureColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f39c12' : '#e74c3c';
    }
    return '#e91e63'; // 분홍색
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
          IOT 지표
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: getSecondaryTextColor() }}>
          설비 온도 및 압력 실시간 모니터링 데이터입니다.
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
              dataKey="온도"
              stroke={getTemperatureColor()}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="압력" 
              stroke={getPressureColor()}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default IotChart; 
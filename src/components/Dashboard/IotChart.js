import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드용 색상 설정
  const darkTextColor = '#b3c5e6';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // 차트 색상
  const temperatureColor = '#2196f3'; // 파란색
  const pressureColor = '#e91e63'; // 분홍색

  return (
    <Box sx={{ 
      p: 1,
      color: isDarkMode ? darkTextColor : 'inherit',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          IOT 지표
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'text.secondary' }}>
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
              tick={{ fill: isDarkMode ? darkTextColor : 'rgba(0, 0, 0, 0.87)' }}
            />
            <YAxis 
              tick={{ fill: isDarkMode ? darkTextColor : 'rgba(0, 0, 0, 0.87)' }}
              domain={[0, 60]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1e3a5f' : '#fff',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                color: isDarkMode ? darkTextColor : 'rgba(0, 0, 0, 0.87)' 
              }}
            />
            <Legend wrapperStyle={{ color: isDarkMode ? darkTextColor : 'rgba(0, 0, 0, 0.87)' }} />
            <Line
              type="monotone"
              dataKey="온도"
              stroke={temperatureColor}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="압력" 
              stroke={pressureColor}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default IotChart; 
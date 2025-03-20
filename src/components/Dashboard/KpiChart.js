import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드용 색상 설정
  const darkTextColor = '#b3c5e6';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // 차트 색상
  const productionColor = '#4caf50';
  const qualityColor = '#ff5722';

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
          KPI 지표
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'text.secondary' }}>
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
              dataKey="생산성"
              stroke={productionColor}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="품질" 
              stroke={qualityColor} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default KpiChart; 
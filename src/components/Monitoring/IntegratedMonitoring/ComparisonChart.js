import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 스타일 정의
const chartStyles = {
  root: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    height: '100%',
  },
  title: {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: '16px',
    color: '#2c3e50',
  },
  chartContainer: {
    height: 300,
    margin: '0 auto',
  },
};

// 전력량 비교 차트 컴포넌트
const ComparisonChart = ({ sensor1Data, sensor2Data }) => {
  // 차트 데이터 처리
  const prepareComparisonData = () => {
    const result = [];
    const maxDataPoints = Math.min(sensor1Data.length, sensor2Data.length);
    
    // 최근 10개 데이터 포인트만 사용
    const startIdx = Math.max(0, maxDataPoints - 10);
    
    for (let i = startIdx; i < maxDataPoints; i++) {
      result.push({
        time: sensor1Data[i].time,
        '센서 1': sensor1Data[i].power,
        '센서 2': sensor2Data[i].power,
      });
    }
    
    return result;
  };
  
  const comparisonData = prepareComparisonData();
  
  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={`tooltip-${index}`}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toFixed(1)} W
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Card sx={chartStyles.root}>
      <CardContent>
        <Typography variant="h6" sx={chartStyles.title}>
          센서 전력량 비교
        </Typography>
        
        <Box sx={chartStyles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => value.substring(0, 5)}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="센서 1" fill="#2196f3" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="센서 2" fill="#4caf50" radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box display="flex" justifyContent="space-around" mt={2}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              센서 1 평균
            </Typography>
            <Typography 
              variant="h6" 
              color="primary"
              fontWeight="bold"
            >
              {(sensor1Data.reduce((sum, item) => sum + item.power, 0) / sensor1Data.length).toFixed(1)} W
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              센서 2 평균
            </Typography>
            <Typography 
              variant="h6" 
              color="#4caf50"
              fontWeight="bold"
            >
              {(sensor2Data.reduce((sum, item) => sum + item.power, 0) / sensor2Data.length).toFixed(1)} W
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart; 
import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  toggleGroup: {
    marginBottom: '16px',
  },
  toggleButton: {
    fontSize: '0.75rem',
    padding: '4px 12px',
  },
};

// 전력 사용량 차트 컴포넌트
const PowerUsageChart = ({ usageData }) => {
  // 기간 선택 상태
  const [period, setPeriod] = useState('daily');
  
  // 기간 변경 핸들러
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };
  
  // 현재 선택된 기간에 따른 데이터 및 설정
  const periodConfig = {
    daily: {
      data: usageData.daily,
      xAxisKey: 'hour',
      xAxisLabel: '시간',
      yAxisLabel: '전력량 (W)',
    },
    weekly: {
      data: usageData.weekly,
      xAxisKey: 'day',
      xAxisLabel: '요일',
      yAxisLabel: '전력량 (W)',
    },
    monthly: {
      data: usageData.monthly,
      xAxisKey: 'date',
      xAxisLabel: '일자',
      yAxisLabel: '전력량 (W)',
    },
    yearly: {
      data: usageData.yearly,
      xAxisKey: 'month',
      xAxisLabel: '월',
      yAxisLabel: '전력량 (W)',
    },
  };
  
  const { data, xAxisKey, xAxisLabel, yAxisLabel } = periodConfig[period];
  
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
              {entry.name}: {entry.value.toFixed(1)} {period === 'daily' ? 'W' : 'Wh'}
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={chartStyles.title}>
            전력 사용량 추이
          </Typography>
          
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            sx={chartStyles.toggleGroup}
          >
            <ToggleButton value="daily" sx={chartStyles.toggleButton}>
              일간
            </ToggleButton>
            <ToggleButton value="weekly" sx={chartStyles.toggleButton}>
              주간
            </ToggleButton>
            <ToggleButton value="monthly" sx={chartStyles.toggleButton}>
              월간
            </ToggleButton>
            <ToggleButton value="yearly" sx={chartStyles.toggleButton}>
              연간
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={chartStyles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 10 }}
                label={{ 
                  value: xAxisLabel, 
                  position: 'insideBottomRight', 
                  offset: -5 
                }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="sensor1"
                name="센서 1"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="sensor2"
                name="센서 2"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        
        <Box display="flex" justifyContent="space-around" mt={2}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              센서 1 평균
            </Typography>
            <Typography 
              variant="h6" 
              color="#8884d8"
              fontWeight="bold"
            >
              {(data.reduce((sum, item) => sum + item.sensor1, 0) / data.length).toFixed(1)} {period === 'daily' ? 'W' : 'Wh'}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              센서 2 평균
            </Typography>
            <Typography 
              variant="h6" 
              color="#82ca9d"
              fontWeight="bold"
            >
              {(data.reduce((sum, item) => sum + item.sensor2, 0) / data.length).toFixed(1)} {period === 'daily' ? 'W' : 'Wh'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PowerUsageChart; 
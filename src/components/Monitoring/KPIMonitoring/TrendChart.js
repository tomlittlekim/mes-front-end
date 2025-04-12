import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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

// KPI 추세 차트 컴포넌트
const TrendChart = ({ title, data, dataKey, unit, target, targetLabel, isLowerBetter = false }) => {
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
          <Typography
            variant="body2"
            sx={{ color: '#1976d2' }}
          >
            {payload[0].name}: {payload[0].value.toFixed(2)} {unit}
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // 최고/최저값 계산
  const values = data.map(item => item[dataKey]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  // 기준선 및 범위 계산
  const yDomain = isLowerBetter
    ? [Math.min(minValue, target) * 0.9, Math.max(maxValue, target) * 1.1]
    : [Math.min(minValue, target) * 0.9, Math.max(maxValue, target) * 1.1];
  
  return (
    <Card sx={chartStyles.root}>
      <CardContent>
        <Typography variant="h6" sx={chartStyles.title}>
          {title}
        </Typography>
        
        <Box sx={chartStyles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={yDomain}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={target} 
                stroke="#ff9800" 
                strokeDasharray="5 5" 
                label={{
                  value: targetLabel || `목표: ${target}`,
                  position: 'right',
                  fill: '#ff9800',
                  fontSize: 12
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                name={title}
                stroke="#1976d2"
                strokeWidth={2}
                dot={true}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Box display="flex" justifyContent="space-around" mt={2}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              최소값
            </Typography>
            <Typography 
              variant="h6" 
              color={isLowerBetter ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              {minValue.toFixed(2)} {unit}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              최대값
            </Typography>
            <Typography 
              variant="h6" 
              color={isLowerBetter ? 'error.main' : 'success.main'}
              fontWeight="bold"
            >
              {maxValue.toFixed(2)} {unit}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              목표
            </Typography>
            <Typography 
              variant="h6" 
              color="warning.main"
              fontWeight="bold"
            >
              {target.toFixed(2)} {unit}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendChart; 
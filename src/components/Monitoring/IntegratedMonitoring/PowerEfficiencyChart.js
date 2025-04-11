import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
    height: 240,
    margin: '0 auto',
  },
};

// 전력 효율 차트 컴포넌트
const PowerEfficiencyChart = ({ sensorData }) => {
  // 효율 데이터 계산 및 처리
  const calculateEfficiencyData = (sensor) => {
    const { efficiency } = sensor;
    
    // 효율이 음수인 경우 (낭비) 처리
    const efficiencyValue = Math.max(0, efficiency);
    const remainingValue = 100 - efficiencyValue;
    
    return [
      { name: '효율', value: efficiencyValue },
      { name: '낭비', value: remainingValue },
    ];
  };
  
  const sensor1Data = calculateEfficiencyData(sensorData.sensor1);
  const sensor2Data = calculateEfficiencyData(sensorData.sensor2);
  
  // 상태에 따른 색상 설정
  const getStatusColors = (status) => {
    switch (status) {
      case 'good':
        return ['#4caf50', '#e0e0e0'];
      case 'normal':
        return ['#2196f3', '#e0e0e0'];
      case 'warning':
        return ['#ff9800', '#e0e0e0'];
      default:
        return ['#2196f3', '#e0e0e0'];
    }
  };
  
  const sensor1Colors = getStatusColors(sensorData.sensor1.status);
  const sensor2Colors = getStatusColors(sensorData.sensor2.status);
  
  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
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
          <Typography variant="body2">
            {payload[0].name}: {payload[0].value.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Card sx={chartStyles.root}>
      <CardContent>
        <Typography variant="h6" sx={chartStyles.title}>
          전력 효율 분석
        </Typography>
        
        <Box sx={chartStyles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* 센서 1 데이터 */}
              <Pie
                data={sensor1Data}
                cx="30%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={false}
              >
                {sensor1Data.map((entry, index) => (
                  <Cell key={`cell-sensor1-${index}`} fill={sensor1Colors[index]} />
                ))}
              </Pie>
              
              {/* 센서 2 데이터 */}
              <Pie
                data={sensor2Data}
                cx="70%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={false}
              >
                {sensor2Data.map((entry, index) => (
                  <Cell key={`cell-sensor2-${index}`} fill={sensor2Colors[index]} />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Box display="flex" justifyContent="space-around" mt={2}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              센서 1 효율
            </Typography>
            <Typography 
              variant="h6" 
              color={sensorData.sensor1.efficiency >= 0 ? 'primary' : 'error'}
              fontWeight="bold"
            >
              {sensorData.sensor1.efficiency.toFixed(1)}%
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" color="textSecondary">
              센서 2 효율
            </Typography>
            <Typography 
              variant="h6" 
              color={sensorData.sensor2.efficiency >= 0 ? 'primary' : 'error'}
              fontWeight="bold"
            >
              {sensorData.sensor2.efficiency.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PowerEfficiencyChart; 
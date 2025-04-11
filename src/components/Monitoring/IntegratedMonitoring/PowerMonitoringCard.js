import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Box, Card, CardContent, Typography, Grid, Chip, Divider } from '@mui/material';

// 스타일 및 색상 정의
const cardStyles = {
  root: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    height: '100%',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
    },
  },
  title: {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: '12px',
    color: '#2c3e50',
  },
  subTitle: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    marginBottom: '8px',
  },
  value: {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#1a73e8',
    marginRight: '8px',
  },
  unit: {
    fontSize: '1rem',
    color: '#7f8c8d',
    alignSelf: 'flex-end',
    marginBottom: '8px',
  },
  chartContainer: {
    height: 200,
    marginTop: '16px',
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
  },
  statusChip: {
    fontWeight: 500,
    height: '24px',
  },
};

// 전력량 모니터링 카드 컴포넌트
const PowerMonitoringCard = ({ title, sensorData, chartData }) => {
  // 상태에 따른 색상 및 스타일 지정
  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  // 추세에 따른 색상 및 스타일 지정
  const getTrendStyle = (trend) => {
    switch (trend) {
      case 'increasing':
        return { color: '#f44336', label: '↑ 증가' };
      case 'decreasing':
        return { color: '#4caf50', label: '↓ 감소' };
      default:
        return { color: '#757575', label: '→ 안정' };
    }
  };

  const trendStyle = getTrendStyle(sensorData.trend);

  // 차트 데이터 처리 및 설정
  const averagePower = chartData.reduce((sum, item) => sum + item.power, 0) / chartData.length;
  
  return (
    <Card sx={cardStyles.root}>
      <CardContent>
        <Typography variant="h6" sx={cardStyles.title}>
          {title}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={cardStyles.subTitle}>
              현재 전력
            </Typography>
            <Box display="flex" alignItems="baseline">
              <Typography sx={cardStyles.value}>{sensorData.power.toFixed(1)}</Typography>
              <Typography sx={cardStyles.unit}>W</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={cardStyles.subTitle}>
              누적 에너지
            </Typography>
            <Box display="flex" alignItems="baseline">
              <Typography sx={cardStyles.value}>{sensorData.energy.toFixed(2)}</Typography>
              <Typography sx={cardStyles.unit}>kWh</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={cardStyles.subTitle}>
              전압
            </Typography>
            <Box display="flex" alignItems="baseline">
              <Typography sx={{ ...cardStyles.value, fontSize: '1.5rem' }}>
                {sensorData.voltage.toFixed(1)}
              </Typography>
              <Typography sx={cardStyles.unit}>V</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={cardStyles.subTitle}>
              전류
            </Typography>
            <Box display="flex" alignItems="baseline">
              <Typography sx={{ ...cardStyles.value, fontSize: '1.5rem' }}>
                {sensorData.current.toFixed(2)}
              </Typography>
              <Typography sx={cardStyles.unit}>A</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={cardStyles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
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
              <Tooltip
                formatter={(value) => [`${value.toFixed(1)} W`, '전력량']}
                labelFormatter={(label) => `시간: ${label}`}
              />
              <ReferenceLine y={averagePower} stroke="#888" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#2196f3"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mt={2} alignItems="center">
          <Box sx={cardStyles.indicator}>
            <Chip 
              label={`상태: ${sensorData.status}`} 
              size="small" 
              sx={{ 
                ...cardStyles.statusChip, 
                backgroundColor: getStatusColor(sensorData.status),
                color: 'white'
              }} 
            />
          </Box>
          <Box sx={cardStyles.indicator}>
            <Typography variant="body2" sx={{ color: trendStyle.color, fontWeight: 500 }}>
              {trendStyle.label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PowerMonitoringCard; 
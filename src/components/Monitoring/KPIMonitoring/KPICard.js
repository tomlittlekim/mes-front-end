import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Tooltip } from '@mui/material';

// 스타일 정의
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
    fontSize: '1rem',
    marginBottom: '8px',
    color: '#2c3e50',
  },
  value: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1a73e8',
    marginRight: '8px',
  },
  unit: {
    fontSize: '1rem',
    color: '#7f8c8d',
    alignSelf: 'flex-end',
    marginBottom: '8px',
  },
  progress: {
    height: 10,
    borderRadius: 5,
    marginTop: 2,
    marginBottom: 2,
  },
  target: {
    fontSize: '0.875rem',
    color: '#7f8c8d',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
};

// KPI 카드 컴포넌트
const KPICard = ({ title, current, target, unit, description, achievementRate = 0, trend = [] }) => {
  // 색상 결정 함수
  const getProgressColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'primary'; 
    if (rate >= 50) return 'warning';
    return 'error';
  };

  // 달성율에 따른 색상
  const progressColor = getProgressColor(achievementRate);
  
  // 달성율 값 제한 (0-100)
  const clampedRate = Math.min(100, Math.max(0, achievementRate));
  
  return (
    <Card sx={cardStyles.root}>
      <CardContent>
        <Typography variant="h6" sx={cardStyles.title}>
          {title}
        </Typography>
        
        <Tooltip title={description || ''} placement="top" arrow>
          <Box display="flex" alignItems="baseline" mb={1}>
            <Typography sx={cardStyles.value}>{current}</Typography>
            <Typography sx={cardStyles.unit}>{unit}</Typography>
          </Box>
        </Tooltip>
        
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={clampedRate} 
            color={progressColor}
            sx={cardStyles.progress} 
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight="500">
            달성율: {typeof achievementRate === 'number' ? achievementRate.toFixed(1) : '0.0'}%
          </Typography>
          <Typography variant="body2" sx={cardStyles.target}>
            목표: {target} {unit}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard; 
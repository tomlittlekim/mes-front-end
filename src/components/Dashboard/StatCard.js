import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const StatCard = ({ title, value, trend, status }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드 색상 설정
  const darkTextColor = '#b3c5e6';
  
  const isPositive = status === 'up';
  
  // 카드별 추가 텍스트 정의
  const getAdditionalText = () => {
    switch(title) {
      case '생산 가동률':
        return '계획 대비 생산 달성률';
      case '품질 양품률':
        return '전체 생산량 대비 양품 비율';
      case '재고 현황':
        return '현재 총 재고 수량';
      case '설비 가동률':
        return '설비 정상 가동 시간 비율';
      default:
        return '';
    }
  };
  
  return (
    <Box sx={{ 
      p: 1,
      display: 'flex',
      flexDirection: 'column',
      color: isDarkMode ? darkTextColor : 'inherit'
    }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {isPositive ? (
          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
        ) : (
          <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
        )}
        <Typography 
          variant="caption" 
          sx={{ 
            color: isPositive ? 'success.main' : 'error.main',
            fontWeight: 500,
            mr: 0.5 
          }}
        >
          {isPositive ? '+' : '-'}{trend}
        </Typography>
        <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'text.secondary' }}>
          지난 달 대비
        </Typography>
      </Box>
      <Typography 
        variant="caption" 
        sx={{ 
          color: isDarkMode ? 'rgba(179, 197, 230, 0.6)' : 'text.secondary',
          fontSize: '0.75rem',
          fontStyle: 'italic'
        }}
      >
        {getAdditionalText()}
      </Typography>
    </Box>
  );
};

export default StatCard;
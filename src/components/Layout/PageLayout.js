import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const PageLayout = ({ title, children }) => {
  // 현재 테마 가져오기
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
  
  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#2d4764' : '#e0e0e0';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      padding: 0
    }}>
      {title && (
        <Box sx={{ 
          mb: 2,
          pt: 1,
          pl: 1,
          pr: 1
        }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 600,
              color: getTextColor(),
              pb: 1,
              borderBottom: `1px solid ${getBorderColor()}`
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <Box sx={{ pt: title ? 0 : 1, pl: 1, pr: 1, pb: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout; 
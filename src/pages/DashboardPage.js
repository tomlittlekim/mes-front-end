import React from 'react';
import DashboardContainer from '../containers/DashboardContainer';
import { Box, Typography, useTheme } from '@mui/material';

const DashboardPage = () => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드 색상 설정
  const darkTextColor = '#b3c5e6';
  const darkBorderColor = '#2d4764';

  return (
    <>
      <Box sx={{ 
        p: 2, 
        minHeight: '100vh'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          borderBottom: `1px solid ${isDarkMode ? darkBorderColor : '#e0e0e0'}`,
          pb: 1
        }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 600,
              color: isDarkMode ? darkTextColor : 'inherit'
            }}
          >
            대시보드
          </Typography>
        </Box>
        <DashboardContainer />
      </Box>
    </>
  );
};

export default DashboardPage;
import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

const ApiStatus = ({ status }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드 색상 설정
  const darkTextColor = '#b3c5e6';

  const getStatusColor = (status) => {
    if (status === 'online') return theme.palette.success.main;
    if (status === 'degraded') return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStatusText = (status) => {
    if (status === 'online') return '정상 가동 중';
    if (status === 'degraded') return '성능 저하';
    return '점검 중';
  };

  const statusItems = [
    { key: 'mainEquipment', label: '주요 설비', status: status.mainEquipment },
    { key: 'assemblyLine', label: '조립 라인', status: status.assemblyLine },
    { key: 'packagingSystem', label: '포장 시스템', status: status.packagingSystem },
    { key: 'qualityControl', label: '품질 관리 시스템', status: status.qualityControl }
  ];

  return (
    <Box sx={{ 
      p: 1,
      color: isDarkMode ? darkTextColor : 'inherit'
    }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        설비 가동 상태
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'text.secondary' }}>
        주요 생산 설비의 현재 작동 상태
      </Typography>

      <Grid container spacing={2}>
        {statusItems.map((item) => (
          <Grid item xs={12} sm={6} key={item.key}>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1,
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                }
              }}
            >
              <CircleIcon 
                sx={{ 
                  fontSize: 12, 
                  mr: 1.5, 
                  color: getStatusColor(item.status) 
                }} 
              />
              <Box>
                <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'text.secondary' }}>
                  {item.label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  {getStatusText(item.status)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ApiStatus;
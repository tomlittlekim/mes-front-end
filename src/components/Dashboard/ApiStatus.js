import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const ApiStatus = ({ status }) => {
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

  const getStatusColor = (status) => {
    if (domain === DOMAINS.PEMS) {
      if (status === 'online') return isDarkMode ? '#f39c12' : '#d35400';
      if (status === 'degraded') return theme.palette.warning.main;
      return theme.palette.error.main;
    } else {
      if (status === 'online') return theme.palette.success.main;
      if (status === 'degraded') return theme.palette.warning.main;
      return theme.palette.error.main;
    }
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: getTextColor() }}>
        설비 가동 상태
      </Typography>
      <Grid container spacing={2}>
        {statusItems.map(item => (
          <Grid item xs={12} sm={6} md={3} key={item.key}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
                color: getTextColor()
              }}
            >
              <CircleIcon sx={{ color: getStatusColor(item.status), fontSize: 14, mr: 1 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: getStatusColor(item.status) }}>
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
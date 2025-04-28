import React from 'react';
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { getTextColor, getBorderColor } from '../utils/styleUtils';

/**
 * BOM 관리 페이지 헤더 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.title - 페이지 제목
 * @param {Function} props.setIsHelpModalOpen - 도움말 모달 열기 함수
 * @param {string} props.domain - 도메인
 * @param {boolean} props.isDarkMode - 다크모드 여부
 * @returns {JSX.Element}
 */
const PageHeader = ({ title, setIsHelpModalOpen, domain, isDarkMode }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      borderBottom: `1px solid ${getBorderColor(domain, isDarkMode)}`,
      pb: 1
    }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 600,
          color: getTextColor(domain, isDarkMode)
        }}
      >
        {title}
      </Typography>
      <IconButton
        onClick={() => setIsHelpModalOpen(true)}
        sx={{
          ml: 1,
          color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: isDarkMode
              ? alpha(theme.palette.primary.light, 0.1)
              : alpha(theme.palette.primary.main, 0.05)
          }
        }}
      >
        <HelpOutlineIcon />
      </IconButton>
    </Box>
  );
};

export default PageHeader; 
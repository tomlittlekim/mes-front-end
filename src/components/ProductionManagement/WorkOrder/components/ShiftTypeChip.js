import React from 'react';
import { Chip, useTheme } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';

/**
 * 주/야간 구분을 위한 칩 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.type - 주/야간 타입 ('DAY' 또는 'NIGHT')
 * @returns {JSX.Element}
 */
const ShiftTypeChip = ({ type }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isDay = type === 'DAY';

  // 주간(DAY) 스타일
  const dayChipStyle = {
    bgcolor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
    color: isDarkMode ? '#ffc107' : '#ff8f00',
    border: `1px solid ${isDarkMode ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 193, 7, 0.3)'}`,
    '& .MuiChip-icon': {
      color: isDarkMode ? '#ffc107' : '#ff8f00'
    }
  };

  // 야간(NIGHT) 스타일
  const nightChipStyle = {
    bgcolor: isDarkMode ? 'rgba(66, 165, 245, 0.2)' : 'rgba(66, 165, 245, 0.1)',
    color: isDarkMode ? '#42a5f5' : '#1976d2',
    border: `1px solid ${isDarkMode ? 'rgba(66, 165, 245, 0.5)' : 'rgba(66, 165, 245, 0.3)'}`,
    '& .MuiChip-icon': {
      color: isDarkMode ? '#42a5f5' : '#1976d2'
    }
  };

  return (
      <Chip
          icon={isDay ? <WbSunnyIcon fontSize="small" /> : <NightsStayIcon fontSize="small" />}
          label={isDay ? "주간" : "야간"}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 500,
            ...(isDay ? dayChipStyle : nightChipStyle),
            minWidth: '80px',
            justifyContent: 'center'
          }}
      />
  );
};

export default ShiftTypeChip;
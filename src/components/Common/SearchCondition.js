import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Button, 
  Stack, 
  Box, 
  Typography, 
  useTheme,
  alpha,
  Paper,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * 검색 조건용 공통 컴포넌트
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 검색 필드 컴포넌트들
 * @param {Function} props.onSearch - 검색 버튼 클릭 시 실행할 함수
 * @param {Function} props.onReset - 초기화 버튼 클릭 시 실행할 함수
 * @param {String} props.title - 검색 조건 제목 (기본값: "조회조건")
 * @returns {JSX.Element}
 */
const SearchCondition = ({ 
  children, 
  onSearch, 
  onReset, 
  title = "조회조건"
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 다크모드 색상 설정
  const darkHeaderBg = '#1a365d';
  const darkBorderColor = '#2d4764';
  const darkTextColor = '#b3c5e6';
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: isDarkMode ? '#102a43' : '#ffffff',
        border: `1px solid ${isDarkMode ? darkBorderColor : alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      <Box 
        sx={{ 
          p: 1.5,
          pb: 1.2,
          display: 'flex',
          alignItems: 'center',
          background: isDarkMode 
            ? `linear-gradient(90deg, ${darkHeaderBg} 0%, ${alpha(darkHeaderBg, 0.8)} 100%)` 
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          borderBottom: `1px solid ${isDarkMode ? darkBorderColor : alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <FilterListIcon sx={{ 
          mr: 1.5, 
          color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main 
        }} />
        <Typography 
          variant="subtitle1" 
          fontWeight="500"
          sx={{ 
            color: isDarkMode ? darkTextColor : theme.palette.text.primary
          }}
        >
          {title}
        </Typography>
      </Box>
      
      <CardContent sx={{ pt: 2.5, pb: 2 }}>
        <form onSubmit={(e) => { e.preventDefault(); onSearch && onSearch(); }}>
          <Grid container spacing={2} alignItems="center">
            {/* 검색 필드들 */}
            {children}
            
            {/* 버튼 영역 */}
            <Grid item xs={12}>
              <Divider sx={{ mt: 1.5, mb: 1.5 }} />
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end'
                }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Button 
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={onReset}
                    color="secondary"
                    size="medium"
                    sx={{ 
                      borderRadius: 1.5,
                      px: 2,
                      py: 0.8,
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    초기화
                  </Button>
                  <Button 
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={onSearch}
                    type="submit"
                    size="medium"
                    sx={{ 
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.8,
                      fontWeight: 500,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    조회
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Paper>
  );
};

export default SearchCondition; 
import React, { useState, useMemo } from 'react';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

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
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  
  // children을 배열로 변환
  const childrenArray = React.Children.toArray(children);
  
  // 첫 줄에 표시할 항목들 (최대 4개)
  const visibleItems = useMemo(() => {
    return childrenArray.slice(0, 4);
  }, [childrenArray]);
  
  // 숨겨진 항목들
  const hiddenItems = useMemo(() => {
    return childrenArray.slice(4);
  }, [childrenArray]);
  
  // 더보기 버튼이 필요한지 확인
  const hasMoreItems = hiddenItems.length > 0;
  
  // 도메인별 색상 설정
  const getHeaderBg = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#fcf2e6';
    }
    return isDarkMode ? '#1a365d' : '#f0f7ff';
  };
  
  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#2d4764' : alpha(theme.palette.primary.main, 0.1);
  };
  
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : theme.palette.text.primary;
    }
    return isDarkMode ? '#b3c5e6' : theme.palette.text.primary;
  };
  
  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2d1e0f' : '#ffffff';
    }
    return isDarkMode ? '#102a43' : '#ffffff';
  };
  
  // PEMS 도메인 초기화 버튼 색상 가시성 향상
  const getResetButtonColor = () => {
    if (domain === DOMAINS.PEMS) {
      return 'primary';
    }
    return 'primary';
  };
  
  // PEMS 도메인 초기화 버튼 스타일
  const getResetButtonStyle = () => {
    if (domain === DOMAINS.PEMS) {
      return {
        borderRadius: 1.5,
        px: 2,
        py: 0.8,
        borderColor: isDarkMode ? '#e67e22' : '#d35400',
        color: isDarkMode ? '#e67e22' : '#d35400',
        '&:hover': {
          borderColor: isDarkMode ? '#f39c12' : '#e67e22',
          backgroundColor: isDarkMode ? 'rgba(231, 126, 34, 0.1)' : 'rgba(211, 84, 0, 0.05)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      };
    }
    
    return { 
      borderRadius: 1.5,
      px: 2,
      py: 0.8,
      borderColor: isDarkMode ? '#1976d2' : '#1976d2',
      color: isDarkMode ? '#ffffff' : '#1976d2',
      '&:hover': {
        borderColor: isDarkMode ? '#2196f3' : '#2196f3',
        backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    };
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        mb: 1.5, 
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: getBgColor(),
        border: `1px solid ${getBorderColor()}`
      }}
    >
      <Box 
        sx={{ 
          p: 1,
          pb: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isDarkMode 
            ? `linear-gradient(90deg, ${getHeaderBg()} 0%, ${alpha(getHeaderBg(), 0.8)} 100%)` 
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          borderBottom: `1px solid ${getBorderColor()}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ 
            mr: 1,
            fontSize: '1.1rem',
            color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main 
          }} />
          <Typography 
            variant="subtitle2" 
            fontWeight="500"
            sx={{ 
              color: getTextColor(),
              fontSize: '0.9rem'
            }}
          >
            {title}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ pr: 1 }}>
          <Button 
            variant="outlined"
            startIcon={<RestartAltIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={onReset}
            color={getResetButtonColor()}
            size="small"
            sx={{
              ...getResetButtonStyle(),
              minWidth: 'auto',
              px: 1.5,
              py: 0.4,
              fontSize: '0.8rem'
            }}
          >
            초기화
          </Button>
          <Button 
            variant="contained"
            startIcon={<SearchIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={onSearch}
            type="submit"
            size="small"
            sx={{ 
              borderRadius: 1,
              px: 1.5,
              py: 0.4,
              minWidth: 'auto',
              fontSize: '0.8rem',
              fontWeight: 500,
              boxShadow: 1,
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }
            }}
          >
            조회
          </Button>
        </Stack>
      </Box>
      
      <CardContent 
        sx={{ 
          pt: 1, 
          pb: 1, 
          px: 2,
          '&:last-child': {
            pb: 1
          }
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); onSearch && onSearch(); }}>
          <Grid container spacing={1} alignItems="center">
            {/* 첫 줄에 표시할 검색 필드들 */}
            {visibleItems}
            
            {/* 숨겨진 검색 필드들 */}
            {isExpanded && hiddenItems}
            
            {/* 더보기 버튼 */}
            {hasMoreItems && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  size="small"
                  sx={{
                    color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: isDarkMode 
                        ? alpha(theme.palette.primary.light, 0.1)
                        : alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {isExpanded ? '접기' : '더보기'}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Paper>
  );
};

export default SearchCondition; 
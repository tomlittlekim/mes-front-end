import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  useTheme,
  alpha,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const HelpModal = ({ open, onClose, title, children }) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // 도메인별 색상 설정 함수들 (하단 정보 영역과 동일)
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };

  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.95)' : 'rgba(252, 235, 212, 0.95)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.95)' : 'rgba(232, 244, 253, 0.95)';
  };

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#3b82f6' : '#1976d2';
  };

  const getHeaderBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(230, 126, 34, 0.1)' : 'rgba(211, 84, 0, 0.1)';
    }
    return isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(25, 118, 210, 0.1)';
  };

  return (
      <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              borderRadius: 0,
              overflow: 'visible'
            }
          }}
          sx={{
            '& .MuiBackdrop-root': {
              backgroundColor: isDarkMode 
                ? 'rgba(0, 0, 0, 0.7)' 
                : 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }
          }}
      >
        <Paper
            elevation={0}
            sx={{
              bgcolor: getBgColor(),
              border: `2px solid ${getBorderColor()}`,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              boxShadow: isDarkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${getAccentColor()}, ${alpha(getAccentColor(), 0.6)})`,
                zIndex: 1
              }
            }}
        >
          {/* 헤더 영역 */}
          <Box
              sx={{
                bgcolor: getHeaderBgColor(),
                p: 3,
                pb: 2,
                position: 'relative',
                borderBottom: `1px solid ${alpha(getBorderColor(), 0.3)}`
              }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: alpha(getAccentColor(), 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${alpha(getAccentColor(), 0.3)}`
                    }}
                >
                  <HelpOutlineIcon 
                      sx={{ 
                        color: getAccentColor(), 
                        fontSize: 28,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                  />
                </Box>
                <Box>
                  <Typography 
                      variant="h5" 
                      component="h2"
                      sx={{ 
                        color: getTextColor(),
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        lineHeight: 1.2,
                        textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                      }}
                  >
                    {title}
                  </Typography>
                  <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha(getTextColor(), 0.7),
                        mt: 0.5,
                        fontWeight: 500
                      }}
                  >
                    도움말 및 사용 가이드
                  </Typography>
                </Box>
              </Box>
              <IconButton
                  onClick={onClose}
                  sx={{
                    color: alpha(getTextColor(), 0.7),
                    bgcolor: alpha(getTextColor(), 0.05),
                    border: `1px solid ${alpha(getBorderColor(), 0.3)}`,
                    '&:hover': {
                      bgcolor: alpha(getTextColor(), 0.1),
                      color: getTextColor(),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* 컨텐츠 영역 */}
          <Box sx={{ p: 3, pt: 2.5 }}>
            <Box
                sx={{
                  bgcolor: alpha(getBgColor(), 0.3),
                  border: `1px solid ${alpha(getBorderColor(), 0.5)}`,
                  borderRadius: 2,
                  p: 3,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, ${alpha(getAccentColor(), 0.3)}, transparent)`,
                    borderRadius: '2px 2px 0 0'
                  }
                }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <InfoIcon 
                    sx={{ 
                      color: getAccentColor(), 
                      fontSize: 20,
                      opacity: 0.8
                    }} 
                />
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: getTextColor(),
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                >
                  사용 방법
                </Typography>
              </Box>
              
              <Divider 
                  sx={{ 
                    mb: 2.5, 
                    borderColor: alpha(getBorderColor(), 0.3),
                    opacity: 0.6
                  }} 
              />
              
              <Stack spacing={2}>
                {React.Children.map(children, (child, index) => (
                  <Box
                      key={index}
                      sx={{
                        pl: 2,
                        borderLeft: `3px solid ${alpha(getAccentColor(), 0.3)}`,
                        py: 0.5,
                        '&:hover': {
                          borderLeftColor: alpha(getAccentColor(), 0.6),
                          transform: 'translateX(2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                  >
                    {React.cloneElement(child, {
                      sx: {
                        ...child.props.sx,
                        color: getTextColor(),
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                        fontWeight: 400
                      }
                    })}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* 푸터 영역 */}
          <Box
              sx={{
                p: 3,
                pt: 0,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2
              }}
          >
            <Button 
                onClick={onClose} 
                variant="contained"
                sx={{
                  bgcolor: getAccentColor(),
                  color: '#ffffff',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: `0 4px 12px ${alpha(getAccentColor(), 0.3)}`,
                  '&:hover': {
                    bgcolor: alpha(getAccentColor(), 0.9),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 16px ${alpha(getAccentColor(), 0.4)}`
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
            >
              확인
            </Button>
          </Box>
        </Paper>
      </Dialog>
  );
};

export default HelpModal;
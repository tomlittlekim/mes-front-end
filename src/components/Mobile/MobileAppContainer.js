import React, { useEffect } from 'react';
import MobileLayout from './MobileLayout';
import MobileProductManagement from './MobileProduct/MobileProductManagement';
import MobileProductionResult from './MobileProduction/MobileProductionResult';
import { Box, Typography, Card, CardContent, Button, useTheme, Grid } from '@mui/material';
import { useTabs } from '../../contexts/TabContext';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import { Inventory as InventoryIcon, ListAlt as ListAltIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';

const MobileAppContainer = () => {
  const { activeTab, openTab } = useTabs();
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // 도메인별 색상 설정
  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#1976d2' : '#0a2351';
  };

  // 생산실적 메뉴 클릭 시 알림 표시
  const handleProductionResultClick = () => {
    Swal.fire({
      title: '알림',
      text: '개발 중인 메뉴입니다.',
      icon: 'info',
      confirmButtonColor: getAccentColor(),
      confirmButtonText: '확인'
    });
  };

  // 메인 화면 렌더링
  const renderMain = () => (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          메인 화면
        </Typography>

        <Card className="mobile-card" variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<InventoryIcon sx={{ fontSize: '1.8rem' }} />}
                    sx={{
                      bgcolor: getAccentColor(),
                      py: 2,
                      height: '120px',
                      flexDirection: 'column',
                      fontSize: '1.2rem',
                      '& .MuiButton-startIcon': {
                        margin: 0,
                        mb: 1.5,
                        '& svg': {
                          fontSize: '2.2rem'
                        }
                      }
                    }}
                    onClick={() => openTab({ id: 'pi-product', name: '제품관리', group: 'pi' })}
                >
                  제품 관리
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ListAltIcon sx={{ fontSize: '1.8rem' }} />}
                    sx={{
                      bgcolor: getAccentColor(),
                      py: 2,
                      height: '120px',
                      flexDirection: 'column',
                      fontSize: '1.2rem',
                      '& .MuiButton-startIcon': {
                        margin: 0,
                        mb: 1.5,
                        '& svg': {
                          fontSize: '2.2rem'
                        }
                      }
                    }}
                    onClick={() => openTab({ id: 'pd-production-result', name: '생산실적등록', group: 'pd' })}
                >
                  생산실적
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="mobile-card" variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}>
              공지사항
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.5 }}>
              모바일 버전에서는 <strong>제품 관리</strong>와 <strong>생산실적등록</strong> 기능을 이용할 수 있습니다.
              <br />
              <br />
              더 많은 기능을 이용하시려면 PC 버전을 이용해주세요.
            </Typography>
          </CardContent>
        </Card>
      </Box>
  );

  // 활성화된 탭에 따라 컨텐츠 렌더링
  const renderContent = () => {
    if (!activeTab || activeTab === 'main') {
      return renderMain();
    }

    switch (activeTab) {
      case 'pi-product':
        return <MobileProductManagement />;
      case 'pd-production-result':
        return <MobileProductionResult />;
      default:
        return renderMain();
    }
  };

  return (
      <MobileLayout>
        {renderContent()}
      </MobileLayout>
  );
};

export default MobileAppContainer;
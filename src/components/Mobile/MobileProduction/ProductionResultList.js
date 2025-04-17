import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FactoryIcon from '@mui/icons-material/Factory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { getStatusText } from './ProductionResultConstants';

const ProductionResultList = ({ productionList, loading, onEdit, onDelete, onAddNew, getAccentColor, getBorderColor }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 상태 표시용 Chip 컴포넌트
  const ShiftTypeChip = ({ type }) => {
    const isDay = type === 'DAY';

    return (
        <Chip
            icon={isDay ? <WbSunnyIcon sx={{ fontSize: '1rem' }} /> : <NightsStayIcon sx={{ fontSize: '1rem' }} />}
            label={isDay ? "주간" : "야간"}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              fontSize: '0.85rem',
              bgcolor: isDay
                  ? (isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)')
                  : (isDarkMode ? 'rgba(66, 165, 245, 0.2)' : 'rgba(66, 165, 245, 0.1)'),
              color: isDay
                  ? (isDarkMode ? '#ffc107' : '#ff8f00')
                  : (isDarkMode ? '#42a5f5' : '#1976d2'),
              border: `1px solid ${isDay
                  ? (isDarkMode ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 193, 7, 0.3)')
                  : (isDarkMode ? 'rgba(66, 165, 245, 0.5)' : 'rgba(66, 165, 245, 0.3)')}`,
              '& .MuiChip-icon': {
                color: isDay
                    ? (isDarkMode ? '#ffc107' : '#ff8f00')
                    : (isDarkMode ? '#42a5f5' : '#1976d2')
              },
              minWidth: '70px',
              height: '28px',
              justifyContent: 'center'
            }}
        />
    );
  };

  if (loading) {
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">데이터를 불러오는 중...</Typography>
        </Box>
    );
  }

  if (productionList.length === 0) {
    return (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">등록된 생산실적이 없습니다.</Typography>
          <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: '1.3rem' }} />}
              onClick={onAddNew}
              sx={{ 
                mt: 2, 
                bgcolor: getAccentColor(),
                fontSize: '1.1rem',
                py: 1.2,
                px: 2.5
              }}
              size="large"
          >
            생산실적 등록하기
          </Button>
        </Box>
    );
  }

  return (
      <List sx={{
        width: '100%',
        p: 0,
        '& .MuiListItem-root': { p: 0, mb: 2 },
      }}>
        {productionList.map((production) => (
            <ListItem key={production.id} disablePadding>
              <Card
                  variant="outlined"
                  className="mobile-card mobile-touch-item"
                  sx={{
                    width: '100%',
                    borderColor: getBorderColor(),
                    borderRadius: 1.5,
                    boxShadow: '0 1px 5px rgba(0,0,0,0.08)'
                  }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: getAccentColor(), mr: 1, width: 28, height: 28 }}>
                        <FactoryIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="bold" fontSize="1.1rem">
                        {production.equipmentName || production.equipmentId}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <ShiftTypeChip type={production.shiftType || 'DAY'} />
                      <Typography variant="body2" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        ml: 1,
                        fontSize: '0.9rem'
                      }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {production.productionDate}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '1rem' }}>
                    {production.productName || production.productId}
                  </Typography>

                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">양품</Typography>
                      <Typography variant="body1" fontSize="1rem">
                        {production.actualQuantity ? Number(production.actualQuantity).toLocaleString() : '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">불량</Typography>
                      <Typography variant="body1" sx={{
                        color: production.defectQuantity > 0 ? 'error.main' : 'text.primary',
                        fontSize: '1rem'
                      }}>
                        {production.defectQuantity ? Number(production.defectQuantity).toLocaleString() : '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">작업자</Typography>
                      <Typography variant="body1" fontSize="1rem">{production.worker || '-'}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Chip
                        label={`진척률: ${production.progressRate || 0}%`}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.success.light,
                          color: theme.palette.success.contrastText,
                          fontSize: '0.85rem',
                          height: '24px'
                        }}
                    />
                    {Number(production.defectRate) > 0 && (
                        <Chip
                            label={`불량률: ${production.defectRate}%`}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.error.light,
                              color: theme.palette.error.contrastText,
                              fontSize: '0.85rem',
                              height: '24px'
                            }}
                        />
                    )}
                  </Box>

                  {production.workOrderId && (
                      <Typography variant="body2" sx={{
                        display: 'block',
                        mt: 1,
                        color: 'text.secondary',
                        fontSize: '0.9rem'
                      }}>
                        작업지시: {production.workOrderId}
                      </Typography>
                  )}

                  {production.status && (
                      <Chip
                          label={getStatusText(production.status)}
                          size="small"
                          sx={{
                            mt: 1,
                            fontSize: '0.85rem',
                            height: '24px',
                            bgcolor: production.status === 'COMPLETED'
                                ? theme.palette.success.light
                                : production.status === 'IN_PROGRESS'
                                    ? theme.palette.warning.light
                                    : theme.palette.info.light,
                            color: production.status === 'COMPLETED'
                                ? theme.palette.success.contrastText
                                : production.status === 'IN_PROGRESS'
                                    ? theme.palette.warning.contrastText
                                    : theme.palette.info.contrastText
                          }}
                      />
                  )}
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                    {production.createDate ? `등록: ${production.createDate.split('T')[0]}` : ''}
                  </Typography>
                  <Box>
                    <IconButton
                        size="large"
                        onClick={() => onEdit(production)}
                        sx={{ 
                          color: getAccentColor(), 
                          mx: 0.5,
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px'
                        }}
                    >
                      <EditIcon sx={{ fontSize: '1.6rem' }} />
                    </IconButton>
                    <IconButton
                        size="large"
                        onClick={() => onDelete(production.prodResultId)}
                        sx={{ 
                          color: theme.palette.error.main, 
                          mx: 0.5,
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px'
                        }}
                    >
                      <DeleteIcon sx={{ fontSize: '1.6rem' }} />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </ListItem>
        ))}
      </List>
  );
};

export default ProductionResultList;
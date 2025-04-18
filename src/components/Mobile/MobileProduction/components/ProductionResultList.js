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
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const ProductionResultList = ({ 
  productionResults, 
  loading, 
  onEdit, 
  onAddNew, 
  onDelete,
  getAccentColor, 
  getBorderColor,
  productOptions
}) => {
  const theme = useTheme();

  // 제품 정보 조회 함수
  const getProductInfo = (productId) => {
    if (!productId || !productOptions || productOptions.length === 0) {
      return { userMaterialId: '-', materialName: '알 수 없음' };
    }
    
    const product = productOptions.find(p => p.systemMaterialId === productId);
    return product || { userMaterialId: '-', materialName: '알 수 없음' };
  };

  // 날짜 포맷팅 함수
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    try {
      const date = new Date(dateTimeStr);
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (e) {
      return dateTimeStr;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (productionResults.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6">진행중인 생산이 없습니다.</Typography>
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
      {productionResults.map((result) => {
        const product = getProductInfo(result.productId);
        
        return (
          <ListItem key={result.prodResultId} disablePadding>
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
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="bold" color={getAccentColor()} fontSize="1.1rem">
                    {product.materialName}
                  </Typography>
                  <Chip 
                    label={result.defectQty > 0 ? '불량있음' : '정상'}
                    size="small"
                    color={result.defectQty > 0 ? "error" : "success"}
                  />
                </Box>

                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.9rem">제품ID</Typography>
                    <Typography variant="body1" fontSize="1rem">{product.userMaterialId || '-'}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.9rem">양품수량</Typography>
                    <Typography variant="body1" fontSize="1rem" fontWeight="medium">{result.goodQty || '0'}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.9rem">불량수량</Typography>
                    <Typography 
                      variant="body1" 
                      fontSize="1rem" 
                      fontWeight="medium"
                      color={result.defectQty > 0 ? theme.palette.error.main : "inherit"}
                    >
                      {result.defectQty || '0'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">생산시작</Typography>
                      <Typography variant="body1" fontSize="0.9rem">{formatDateTime(result.prodStartTime)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">생산종료</Typography>
                      <Typography variant="body1" fontSize="0.9rem">{formatDateTime(result.prodEndTime)}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {result.resultInfo && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.9rem">작업내용</Typography>
                    <Typography variant="body1" fontSize="0.9rem">{result.resultInfo}</Typography>
                  </Box>
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                  {result.updateDate ? 
                    <>
                      최종 수정:<br/>{formatDateTime(result.updateDate)}
                    </> : 
                    <>
                      등록:<br/>{formatDateTime(result.createDate)}
                    </>
                  }
                </Typography>
                <Box>
                  <IconButton
                    size="large"
                    onClick={() => onEdit(result)}
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
                    onClick={() => onDelete && onDelete(result.prodResultId)}
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
        );
      })}
    </List>
  );
};

export default ProductionResultList; 
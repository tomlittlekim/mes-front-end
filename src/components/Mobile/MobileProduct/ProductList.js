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
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductList = ({ materialList, loading, onEdit, onDelete, onAddNew, getAccentColor, getBorderColor }) => {
  const theme = useTheme();

  if (loading) {
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">데이터를 불러오는 중...</Typography>
        </Box>
    );
  }

  if (materialList.length === 0) {
    return (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">등록된 제품이 없습니다.</Typography>
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
            제품 등록하기
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
        {materialList.map((material) => (
            <ListItem key={material.id} disablePadding>
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
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color={getAccentColor()} fontSize="1.1rem">
                      {material.materialName}
                    </Typography>
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">규격</Typography>
                      <Typography variant="body1" fontSize="1rem">{material.materialStandard || '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">단위</Typography>
                      <Typography variant="body1" fontSize="1rem">{material.unit || '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.9rem">기본수량</Typography>
                      <Typography variant="body1" fontSize="1rem">{material.baseQuantity || '0'}</Typography>
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                      카테고리: {material.materialCategory || '-'}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                    {material.updateDate ? `최종 수정: ${material.updateDate}` : `등록: ${material.createDate}`}
                  </Typography>
                  <Box>
                    <IconButton
                        size="large"
                        onClick={() => onEdit(material)}
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
                        onClick={() => onDelete(material.systemMaterialId)}
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

export default ProductList;
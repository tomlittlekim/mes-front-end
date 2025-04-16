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
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography>데이터를 불러오는 중...</Typography>
        </Box>
    );
  }

  if (materialList.length === 0) {
    return (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography>등록된 제품이 없습니다.</Typography>
          <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddNew}
              sx={{ mt: 2, bgcolor: getAccentColor() }}
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
                    borderColor: getBorderColor()
                  }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color={getAccentColor()}>
                      {material.materialName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {material.userMaterialId}
                    </Typography>
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">규격</Typography>
                      <Typography variant="body2">{material.materialStandard || '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="text.secondary">단위</Typography>
                      <Typography variant="body2">{material.unit || '-'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="text.secondary">기본수량</Typography>
                      <Typography variant="body2">{material.baseQuantity || '0'}</Typography>
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      카테고리: {material.materialCategory || '-'}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {material.updateDate ? `최종 수정: ${material.updateDate}` : `등록: ${material.createDate}`}
                  </Typography>
                  <Box>
                    <IconButton
                        size="small"
                        onClick={() => onEdit(material)}
                        sx={{ color: getAccentColor() }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => onDelete(material.systemMaterialId)}
                        sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon fontSize="small" />
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
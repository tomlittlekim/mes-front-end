import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack
} from '@mui/material';

const ProductHelpDialog = ({ open, onClose, getAccentColor }) => {
  return (
      <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="xs"
      >
        <DialogTitle sx={{
          bgcolor: getAccentColor(),
          color: 'white'
        }}>
          제품관리 도움말
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2">
              • 제품관리에서는 생산하는 제품의 기본 정보를 등록하고 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2">
              • 제품코드, 제품명, 규격, 단위 등의 정보를 관리하여 제품 정보를 체계적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2">
              • 제품 정보는 생산 계획, 재고 관리, 출하 관리 등에서 활용됩니다.
            </Typography>
            <Typography variant="body2">
              • 필수 입력 항목은 제품ID와 제품명입니다.
            </Typography>
            <Typography variant="body2">
              • 등록된 제품은 수정 및 삭제가 가능하지만, 다른 모듈에서 사용 중인 제품은 삭제가 제한될 수 있습니다.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: getAccentColor() }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ProductHelpDialog;
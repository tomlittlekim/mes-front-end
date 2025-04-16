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

const ProductionResultHelpDialog = ({ open, onClose, getAccentColor }) => {
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
          생산실적 도움말
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2">
              • 생산실적에서는 일일 생산량과 작업 정보를 등록할 수 있습니다.
            </Typography>
            <Typography variant="body2">
              • 설비, 제품, 생산일자, 수량은 필수 입력 사항입니다.
            </Typography>
            <Typography variant="body2">
              • 작업지시를 선택하지 않고도 생산실적을 등록할 수 있습니다.
            </Typography>
            <Typography variant="body2">
              • 양품수량과 불량수량을 입력하면 진척률과 불량률이 자동으로 계산됩니다.
            </Typography>
            <Typography variant="body2">
              • 불량수량이 있는 경우 불량정보(불량유형, 원인 등)를 등록해야 합니다.
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

export default ProductionResultHelpDialog;
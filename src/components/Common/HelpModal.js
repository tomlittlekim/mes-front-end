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
  alpha
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const HelpModal = ({ open, onClose, title, children }) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2d1e0f' : '#ffffff';
    }
    return isDarkMode ? '#102a43' : '#ffffff';
  };

  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : theme.palette.text.primary;
    }
    return isDarkMode ? '#b3c5e6' : theme.palette.text.primary;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: getBgColor(),
          borderRadius: 2,
          '& .MuiDialogTitle-root': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HelpOutlineIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ color: getTextColor() }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {children}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="contained" size="small">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpModal; 
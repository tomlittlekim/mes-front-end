// MobileProductionResult.js (대체 파일)
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTabs } from '../../../contexts/TabContext';
import Swal from 'sweetalert2';

const MobileProductionResult = () => {
  const { openTab } = useTabs();

  useEffect(() => {
    // 컴포넌트 마운트 시 알림 표시 후 메인으로 리다이렉트
    Swal.fire({
      title: '알림',
      text: '개발 중인 메뉴입니다.',
      icon: 'info',
      confirmButtonText: '확인'
    }).then(() => {
      openTab({ id: 'main', name: '메인' });
    });
  }, [openTab]);

  return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">개발 중인 메뉴입니다.</Typography>
      </Box>
  );
};

export default MobileProductionResult;
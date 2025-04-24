import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import HelpModal from '../../../Common/HelpModal';
import { getTextColor, getBgColor, getBorderColor } from '../utils/styleUtils';

export const HelpContent = ({
  isHelpModalOpen,
  setIsHelpModalOpen,
  domain,
  isDarkMode
}) => {
  return (
    <>
      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="원부자재 관리 도움말"
      >
        <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
          • 원부자재 관리에서는 원자재와 부자재를 관리합니다.
        </Typography>
        <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
          • 자재의 기본 정보와 재고 관리에 필요한 정보를 등록할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
          • 자재의 사용 여부를 설정하여 활성/비활성 상태를 관리할 수 있습니다.
        </Typography>
      </HelpModal>
    </>
  );
};

export default HelpContent; 
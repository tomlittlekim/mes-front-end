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
        title="제품관리 도움말"
      >
        <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
          • 제품관리에서는 생산하는 제품의 기본 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
          • 제품코드, 제품명, 규격, 단위 등의 정보를 관리하여 제품 정보를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
          • 제품 정보는 생산 계획, 재고 관리, 출하 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </>
  );
};

export default HelpContent; 
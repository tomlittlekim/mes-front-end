import React from 'react';
import { Typography } from '@mui/material';
import HelpModal from '../../Common/HelpModal';
import { getTextColor } from '../utils/styleUtils';

/**
 * BOM 관리 도움말 내용 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.isHelpModalOpen - 도움말 모달 표시 여부
 * @param {Function} props.setIsHelpModalOpen - 도움말 모달 표시 여부 설정 함수
 * @param {string} props.domain - 도메인
 * @param {boolean} props.isDarkMode - 다크모드 여부
 * @returns {JSX.Element}
 */
const HelpContent = ({ isHelpModalOpen, setIsHelpModalOpen, domain, isDarkMode }) => {
  return (
    <HelpModal
      open={isHelpModalOpen}
      onClose={() => setIsHelpModalOpen(false)}
      title="BOM 관리 도움말"
    >
      <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
        • BOM 관리에서는 제품의 구성요소와 조립 방법을 관리합니다.
      </Typography>
      <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
        • BOM 목록에서 특정 제품을 선택하면 해당 제품의 상세 구성요소를 확인할 수 있습니다.
      </Typography>
      <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
        • 각 구성요소의 수량과 단위를 관리하여 생산 계획 수립에 활용할 수 있습니다.
      </Typography>
    </HelpModal>
  );
};

export default HelpContent; 
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
      <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
        BOM(자재명세서)은 제품 생산에 필요한 모든 원재료와 부품의 목록입니다. <br />
        좌측 그리드에는 생산하고자 하는 제품(완제품)이나 반제품을 등록합니다. <br />
        제품(완제품)을 1레벨로 시작해, 그 하위의 반제품은 2레벨, 원자재와 부자재는 3레벨로 구분됩니다.<br />
        반제품을 1레벨로 시작한다면, 그 하위의 원자재와 부자재는 2레벨로 구분됩니다.<br />
        즉, 생산 단계별로 필요한 구성요소를 단계적으로 관리할 수 있습니다.
      </Typography>
    </HelpModal>
  );
};

export default HelpContent; 
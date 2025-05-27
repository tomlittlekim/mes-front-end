import React from 'react';
import { Typography } from '@mui/material';
import HelpModal from '../../../Common/HelpModal';
import { getTextColor } from '../../../BomManagement/utils/styleUtils';

/**
 * KPI 지표 관리 도움말 내용 컴포넌트
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
      title="KPI 지표 관리 도움말"
    >
      <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
        • KPI 지표 관리에서는 회사별로 모니터링할 KPI 지표를 설정합니다.
      </Typography>
      <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
        • 각 회사마다 최대 2개의 KPI 지표를 선택하여 모니터링할 수 있습니다.
      </Typography>
      <Typography variant="body2" color={getTextColor(domain, isDarkMode)}>
        • 지부 선택 드롭다운에서 지부를 선택하면 해당 지부에 속한 회사들을 볼 수 있습니다.
      </Typography>
      <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
        KPI(핵심성과지표)는 기업의 주요 성과를 측정하는 지표입니다. <br />
        지부별, 회사별로 관리할 KPI를 설정할 수 있습니다. <br />
        공통 KPI 지표 선택 영역에서는 해당 지부의 모든 회사에 동일한 KPI를 일괄 적용할 수 있습니다. <br />
        카테고리별로 KPI 지표가 분류되어 있어 필요한 지표를 쉽게 찾을 수 있습니다. <br />
        변경 사항은 '저장' 버튼을 클릭해야 적용됩니다.
      </Typography>
    </HelpModal>
  );
};

export default HelpContent; 
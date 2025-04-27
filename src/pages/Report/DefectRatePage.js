import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import DailyYieldCombined from '../../components/Report/DailyYield/DailyYieldCombined';

/**
 * 레포트 - 불량율 현황 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DefectRatePage = (props) => {
  const tabId = props.tabId || 'report-defect-rate';

  return (
    <PageLayout>
      <DailyYieldCombined tabId={tabId} />
    </PageLayout>
  );
};

export default DefectRatePage; 
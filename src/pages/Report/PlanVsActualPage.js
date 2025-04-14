import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import { PlanVsActual } from '../../components/Report/PlanVsActual'; // index.js를 통해 가져옴

/**
 * 레포트 - 계획 대비 실적 조회 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const PlanVsActualPage = (props) => {
  const tabId = props.tabId || 'report-plan-vs-actual'; // 필요시 고유 ID 부여

  return (
    <PageLayout>
      <PlanVsActual tabId={tabId} />
    </PageLayout>
  );
};

export default PlanVsActualPage; 
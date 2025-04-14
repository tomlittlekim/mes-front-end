import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import { PeriodicProduction } from '../../components/Report/PeriodicProduction';

/**
 * 레포트 - 기간별 생산 실적 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const PeriodicProductionPage = (props) => {
  const tabId = props.tabId || 'report-periodic-production';

  return (
    <PageLayout>
      <PeriodicProduction tabId={tabId} />
    </PageLayout>
  );
};

export default PeriodicProductionPage; 
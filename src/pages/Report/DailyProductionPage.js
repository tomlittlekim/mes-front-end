import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import { DailyProduction } from '../../components/Report/DailyProduction';

/**
 * 레포트 - 생산 일보 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DailyProductionPage = (props) => {
  const tabId = props.tabId || 'report-daily-production';

  return (
    <PageLayout>
      <DailyProduction tabId={tabId} />
    </PageLayout>
  );
};

export default DailyProductionPage; 
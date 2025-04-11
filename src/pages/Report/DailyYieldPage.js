import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import { DailyYield } from '../../components/Report/DailyYield';

/**
 * 레포트 - 일일 생산 수율 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DailyYieldPage = (props) => {
  const tabId = props.tabId || 'report-daily-yield';

  return (
    <PageLayout>
      <DailyYield tabId={tabId} />
    </PageLayout>
  );
};

export default DailyYieldPage; 
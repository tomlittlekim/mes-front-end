import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import IntegratedMonitoring from '../../components/Monitoring/IntegratedMonitoring/IntegratedMonitoring';

/**
 * 통합 모니터링 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const IntegratedMonitoringPage = (props) => {
    const tabId = props.tabId || 'monitoring-integrated';

    return (
        <PageLayout>
            <IntegratedMonitoring tabId={tabId} />
        </PageLayout>
    );
};

export default IntegratedMonitoringPage;
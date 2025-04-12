import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import KPIMonitoring from '../../components/Monitoring/KPIMonitoring/KPIMonitoring';

/**
 * KPI 모니터링 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const KPIMonitoringPage = (props) => {
    const tabId = props.tabId || 'monitoring-kpi';

    return (
        <PageLayout>
            <KPIMonitoring tabId={tabId} />
        </PageLayout>
    );
};

export default KPIMonitoringPage;
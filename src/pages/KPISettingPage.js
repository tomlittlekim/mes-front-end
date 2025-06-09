import React from 'react';
import PageLayout from '../components/Layout/PageLayout';
import KPISetting from '../components/System/KPISetting';

/**
 * KPI 설정 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const KPISettingPage = (props) => {
    const tabId = props.tabId || 'system-kpi-setting';

    return (
        <PageLayout>
            <KPISetting tabId={tabId} />
        </PageLayout>
    );
};

export default KPISettingPage; 
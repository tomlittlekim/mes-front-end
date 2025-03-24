import React from 'react';
import DashboardContainer from '../containers/DashboardContainer';
import PageLayout from '../components/Layout/PageLayout';

const DashboardPage = (props) => {
  return (
    <PageLayout title="대시보드">
      <DashboardContainer />
    </PageLayout>
  );
};

export default DashboardPage;
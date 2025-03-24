import React from 'react';
import LineManagement from '../components/LineManagement/LineManagement';
import PageLayout from '../components/Layout/PageLayout';

const LineManagementPage = (props) => {
  return (
    <PageLayout>
      <LineManagement tabId={props.tabId || 'line'} />
    </PageLayout>
  );
};

export default LineManagementPage; 
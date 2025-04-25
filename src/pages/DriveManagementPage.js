import React from 'react';
import DriveManagement from '../components/Drive/DriveManagement';
import PageLayout from '../components/Layout/PageLayout';

const DriveManagementPage = (props) => {
  return (
    <PageLayout>
      <DriveManagement tabId={props.tabId || 'sy-menu'} />
    </PageLayout>
  );
};

export default DriveManagementPage; 
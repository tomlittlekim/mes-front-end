import React from 'react';
import MaterialManagement from '../components/MaterialManagement/MaterialManagement';
import PageLayout from '../components/Layout/PageLayout';

const MaterialManagementPage = (props) => {
  return (
    <PageLayout>
      <MaterialManagement tabId={props.tabId || 'material'} />
    </PageLayout>
  );
};

export default MaterialManagementPage; 
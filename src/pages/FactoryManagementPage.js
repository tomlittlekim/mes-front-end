import React from 'react';
import FactoryManagement from '../components/FactoryManagement/FactoryManagement';
import PageLayout from '../components/Layout/PageLayout';

const FactoryManagementPage = (props) => {
  return (
    <PageLayout>
      <FactoryManagement tabId={props.tabId || 'ci-factory'} />
    </PageLayout>
  );
};

export default FactoryManagementPage; 
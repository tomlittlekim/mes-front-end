import React from 'react';
import BomManagement from '../components/BomManagement/BomManagement';
import PageLayout from '../components/Layout/PageLayout';

const BomManagementPage = (props) => {
  return (
    <PageLayout>
      <BomManagement tabId={props.tabId || 'bom'} />
    </PageLayout>
  );
};

export default BomManagementPage; 
import React from 'react';
import WarehouseManagement from '../components/WarehouseManagement/WarehouseManagement';
import PageLayout from '../components/Layout/PageLayout';

const WarehouseManagementPage = (props) => {
  return (
    <PageLayout>
      <WarehouseManagement tabId={props.tabId || 'ci-warehouse'} />
    </PageLayout>
  );
};

export default WarehouseManagementPage; 
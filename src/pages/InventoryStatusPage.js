import React from 'react';
import InventoryStatusManagement from '../components/InventoryManagement/InventoryStatusManagement';
import PageLayout from '../components/Layout/PageLayout';

const InventoryStatusPage = (props) => {
  return (
    <PageLayout>
      <InventoryStatusManagement tabId={props.tabId || 'inventory-status'} />
    </PageLayout>
  );
};

export default InventoryStatusPage; 
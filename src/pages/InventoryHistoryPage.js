import React from 'react';
import InventoryHistoryManagement from '../components/InventoryManagement/InventoryHistoryManagement';
import PageLayout from '../components/Layout/PageLayout';

const InventoryHistoryPage = (props) => {
  return (
    <PageLayout>
      <InventoryHistoryManagement tabId={props.tabId || 'inventory-history'} />
    </PageLayout>
  );
};

export default InventoryHistoryPage; 
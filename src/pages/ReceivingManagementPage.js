import React from 'react';
import ReceivingManagement from '../components/InventoryManagement/ReceivingManagement';
import PageLayout from '../components/Layout/PageLayout';

const ReceivingManagementPage = (props) => {
  return (
    <PageLayout>
      <ReceivingManagement tabId={props.tabId || 'mi-inbound'} />
    </PageLayout>
  );
};

export default ReceivingManagementPage; 
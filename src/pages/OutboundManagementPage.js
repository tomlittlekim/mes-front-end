import React from 'react';
import OutboundManagement from '../components/InventoryManagement/OutboundManagement';
import PageLayout from '../components/Layout/PageLayout';

const OutboundManagementPage = (props) => {
  return (
    <PageLayout>
      <OutboundManagement tabId={props.tabId || 'mi-outbound'} />
    </PageLayout>
  );
};

export default OutboundManagementPage; 
import React from 'react';
import OutboundManagement from '../components/InventoryManagement/OutboundManagement';

const OutboundManagementPage = (props) => {
  return (
    <>
      <OutboundManagement tabId={props.tabId || 'mi-outbound'} />
    </>
  );
};

export default OutboundManagementPage; 
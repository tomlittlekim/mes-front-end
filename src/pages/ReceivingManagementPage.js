import React from 'react';
import ReceivingManagement from '../components/InventoryManagement/ReceivingManagement';

const ReceivingManagementPage = (props) => {
  return (
    <>
      <ReceivingManagement tabId={props.tabId || 'mi-inbound'} />
    </>
  );
};

export default ReceivingManagementPage; 
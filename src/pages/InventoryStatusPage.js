import React from 'react';
import InventoryStatusManagement from '../components/InventoryManagement/InventoryStatusManagement';

const InventoryStatusPage = (props) => {
  return <InventoryStatusManagement tabId={props.tabId || 'inventory-status'} />;
};

export default InventoryStatusPage; 
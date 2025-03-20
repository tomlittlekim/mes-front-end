import React from 'react';
import InventoryHistoryManagement from '../components/InventoryManagement/InventoryHistoryManagement';

const InventoryHistoryPage = (props) => {
  return <InventoryHistoryManagement tabId={props.tabId || 'inventory-history'} />;
};

export default InventoryHistoryPage; 
import React from 'react';
import WarehouseManagement from '../components/WarehouseManagement/WarehouseManagement';

const WarehouseManagementPage = (props) => {
  return (
    <>
      <WarehouseManagement tabId={props.tabId || 'ci-warehouse'} />
    </>
  );
};

export default WarehouseManagementPage; 
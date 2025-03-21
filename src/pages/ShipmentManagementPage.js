import React from 'react';
import ShipmentManagement from '../components/ShipmentManagement/ShipmentManagement';

const ShipmentManagementPage = (props) => {
  return (
    <>
      <ShipmentManagement tabId={props.tabId || 'sm-sales'} />
    </>
  );
};

export default ShipmentManagementPage; 
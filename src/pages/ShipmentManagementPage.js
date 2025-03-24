import React from 'react';
import ShipmentManagement from '../components/ShipmentManagement/ShipmentManagement';
import PageLayout from '../components/Layout/PageLayout';

const ShipmentManagementPage = (props) => {
  return (
    <PageLayout>
      <ShipmentManagement tabId={props.tabId || 'sm-sales'} />
    </PageLayout>
  );
};

export default ShipmentManagementPage; 
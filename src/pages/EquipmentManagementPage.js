import React from 'react';
import EquipmentManagement from '../components/EquipmentManagement/EquipmentManagement';
import PageLayout from '../components/Layout/PageLayout';

const EquipmentManagementPage = (props) => {
  return (
    <PageLayout>
      <EquipmentManagement tabId={props.tabId || 'ci-equipment'} />
    </PageLayout>
  );
};

export default EquipmentManagementPage; 
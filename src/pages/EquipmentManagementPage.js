import React from 'react';
import EquipmentManagement from '../components/EquipmentManagement/EquipmentManagement';

const EquipmentManagementPage = (props) => {
  return (
    <>
      <EquipmentManagement tabId={props.tabId || 'ci-equipment'} />
    </>
  );
};

export default EquipmentManagementPage; 
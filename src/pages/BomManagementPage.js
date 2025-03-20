import React from 'react';
import BomManagement from '../components/BomManagement/BomManagement';

const BomManagementPage = (props) => {
  return <BomManagement tabId={props.tabId || 'bom'} />;
};

export default BomManagementPage; 
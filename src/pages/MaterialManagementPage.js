import React from 'react';
import MaterialManagement from '../components/MaterialManagement/MaterialManagement';

const MaterialManagementPage = (props) => {
  return <MaterialManagement tabId={props.tabId || 'material'} />;
};

export default MaterialManagementPage; 
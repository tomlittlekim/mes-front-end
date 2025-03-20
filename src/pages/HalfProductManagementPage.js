import React from 'react';
import HalfProductManagement from '../components/HalfProduct/HalfProductManagement';

const HalfProductManagementPage = (props) => {
  return <HalfProductManagement tabId={props.tabId || 'half-product'} />;
};

export default HalfProductManagementPage; 
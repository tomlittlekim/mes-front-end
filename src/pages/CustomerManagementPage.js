import React from 'react';
import CustomerManagement from '../components/CustomerManagement/CustomerManagement';

const CustomerManagementPage = (props) => {
  return <CustomerManagement tabId={props.tabId || 'customer'} />;
};

export default CustomerManagementPage; 
import React from 'react';
import CustomerManagement from '../components/CustomerManagement/CustomerManagement';
import PageLayout from '../components/Layout/PageLayout';

const CustomerManagementPage = (props) => {
  return (
    <PageLayout>
      <CustomerManagement tabId={props.tabId || 'customer'} />
    </PageLayout>
  );
};

export default CustomerManagementPage; 
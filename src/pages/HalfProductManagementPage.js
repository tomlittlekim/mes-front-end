import React from 'react';
import HalfProductManagement from '../components/HalfProduct/HalfProductManagement';
import PageLayout from '../components/Layout/PageLayout';

const HalfProductManagementPage = (props) => {
  return (
    <PageLayout>
      <HalfProductManagement tabId={props.tabId || 'half-product'} />
    </PageLayout>
  );
};

export default HalfProductManagementPage; 
import React from 'react';
import PageLayout from '../components/Layout/PageLayout';
import HalfProductManagement from "../components/MaterialManagement/HalfProductMaterial/HalfProductManagement";

const HalfProductManagementPage = (props) => {
  return (
    <PageLayout>
      <HalfProductManagement tabId={props.tabId || 'half-product'} />
    </PageLayout>
  );
};

export default HalfProductManagementPage; 
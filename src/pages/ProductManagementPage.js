import React from 'react';
import ProductManagement from '../components/ProductManagement/ProductManagement';
import PageLayout from '../components/Layout/PageLayout';

const ProductManagementPage = (props) => {
  return (
    <PageLayout>
      <ProductManagement tabId={props.tabId || 'pi-product'} />
    </PageLayout>
  );
};

export default ProductManagementPage; 
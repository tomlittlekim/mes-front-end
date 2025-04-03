import React from 'react';
import PageLayout from '../components/Layout/PageLayout';
import ProductManagement from "../components/MaterialManagement/ProductMaterial/ProductManagement";

const ProductManagementPage = (props) => {
  return (
    <PageLayout>
      <ProductManagement tabId={props.tabId || 'pi-product'} />
    </PageLayout>
  );
};

export default ProductManagementPage; 
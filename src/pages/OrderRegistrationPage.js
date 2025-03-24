import React from 'react';
import OrderRegistration from '../components/OrderRegistration/OrderRegistration';
import PageLayout from '../components/Layout/PageLayout';

const OrderRegistrationPage = (props) => {
  return (
    <PageLayout>
      <OrderRegistration tabId={props.tabId || 'sm-order'} />
    </PageLayout>
  );
};

export default OrderRegistrationPage; 
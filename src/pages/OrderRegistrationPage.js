import React from 'react';
import OrderRegistration from '../components/OrderRegistration/OrderRegistration';

const OrderRegistrationPage = (props) => {
  return (
    <>
      <OrderRegistration tabId={props.tabId || 'sm-order'} />
    </>
  );
};

export default OrderRegistrationPage; 
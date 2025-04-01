import React from 'react';
import MaterialManagement from '../components/MaterialManagement/MaterialManagement';
import PageLayout from '../components/Layout/PageLayout';
import {ApolloProvider} from "@apollo/client";

const MaterialManagementPage = ({ tabId }) => {
  return (
      // eslint-disable-next-line no-undef
    <ApolloProvider client={client}>
      <PageLayout>
        <MaterialManagement tabId={tabId || 'material'} />
      </PageLayout>
    </ApolloProvider>
  );
};

export default MaterialManagementPage; 
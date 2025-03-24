import React from 'react';
import AuthorityManagement from '../components/System/AuthorityManagement';
import PageLayout from '../components/Layout/PageLayout';

const AuthorityManagementPage = (props) => {
  return (
    <PageLayout>
      <AuthorityManagement tabId={props.tabId || 'authority'} />
    </PageLayout>
  );
};

export default AuthorityManagementPage; 
import React from 'react';
import UserManagement from '../components/System/UserManagement';
import PageLayout from '../components/Layout/PageLayout';

const UserManagementPage = (props) => {
  return (
    <PageLayout>
      <UserManagement tabId={props.tabId || 'sy-user'} />
    </PageLayout>
  );
};

export default UserManagementPage; 
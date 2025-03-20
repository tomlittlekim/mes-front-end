import React from 'react';
import UserManagement from '../components/System/UserManagement';

const UserManagementPage = (props) => {
  return (
    <>
      <UserManagement tabId={props.tabId || 'sy-user'} />
    </>
  );
};

export default UserManagementPage; 
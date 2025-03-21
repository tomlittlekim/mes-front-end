import React from 'react';
import AuthorityManagement from '../components/System/AuthorityManagement';

const AuthorityManagementPage = (props) => {
  return <AuthorityManagement tabId={props.tabId || 'authority'} />;
};

export default AuthorityManagementPage; 
import React from 'react';
import CompanyInfo from '../components/System/CompanyInfo';

const CompanyInfoPage = (props) => {
  return <CompanyInfo tabId={props.tabId || 'company-info'} />;
};

export default CompanyInfoPage; 
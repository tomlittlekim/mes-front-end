import React from 'react';
import CommonCodeManagement from '../components/CodeManagement/CommonCodeManagement';
import PageLayout from '../components/Layout/PageLayout';

const CommonCodePage = (props) => {
  return (
    <PageLayout>
      <CommonCodeManagement tabId={props.tabId || 'ci-common'} />
    </PageLayout>
  );
};

export default CommonCodePage;
import React from 'react';
import CommonCodeManagement from '../components/CodeManagement/CommonCodeManagement';

const CommonCodePage = (props) => {
  return (
    <>
      <CommonCodeManagement tabId={props.tabId || 'ci-common'} />
    </>
  );
};

export default CommonCodePage;
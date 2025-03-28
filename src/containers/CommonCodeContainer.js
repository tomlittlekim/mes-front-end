import React from 'react';
import CommonCodeManagement from '../components/CodeManagement/CommonCodeManagement';

const CommonCodeContainer = (props) => {
  // 실제 환경에서는 여기서 API 데이터를 가져오는 로직이 있을 것입니다

  return (
      <CommonCodeManagement tabId={props.tabId || 'ci-common'} />
  );
};

export default CommonCodeContainer;
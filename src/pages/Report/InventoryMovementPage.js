import React from 'react';
import PageLayout from '../../components/Layout/PageLayout';
import { InventoryMovement } from '../../components/Report/InventoryMovement';

/**
 * 레포트 - 입출고 현황 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const InventoryMovementPage = (props) => {
  const tabId = props.tabId || 'report-inventory-movement';

  return (
    <PageLayout>
      <InventoryMovement tabId={tabId} />
    </PageLayout>
  );
};

export default InventoryMovementPage; 
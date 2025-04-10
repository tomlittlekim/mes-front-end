import React from 'react';
import { ProductionPlanManagement } from '../components/ProductionManagement/ProductionPlan';
import PageLayout from '../components/Layout/PageLayout';

/**
 * 생산계획 페이지 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionPlanPage = (props) => {
  const tabId = props.tabId || 'mm-plan';

  return (
      <PageLayout>
        <ProductionPlanManagement tabId={tabId} />
      </PageLayout>
  );
};

export default ProductionPlanPage;
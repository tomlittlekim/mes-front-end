import React, { useState, useEffect, memo, useCallback } from 'react';
import { useTabs } from '../../contexts/TabContext';
import DashboardPage from '../../pages/DashboardPage';
import CommonCodePage from '../../pages/CommonCodePage';
import FactoryManagementPage from '../../pages/FactoryManagementPage';
import LineManagementPage from '../../pages/LineManagementPage';
import EquipmentManagementPage from '../../pages/EquipmentManagementPage';
import CustomerManagementPage from '../../pages/CustomerManagementPage';
import WarehouseManagementPage from '../../pages/WarehouseManagementPage';
import MaterialManagementPage from '../../pages/MaterialManagementPage';
import HalfProductManagementPage from '../../pages/HalfProductManagementPage';
import ProductManagementPage from '../../pages/ProductManagementPage';
import BomManagementPage from '../../pages/BomManagementPage';
import OrderRegistrationPage from '../../pages/OrderRegistrationPage';
import ShipmentManagementPage from '../../pages/ShipmentManagementPage';
import ReceivingManagementPage from '../../pages/ReceivingManagementPage';
import OutboundManagementPage from '../../pages/OutboundManagementPage';
import InventoryStatusPage from '../../pages/InventoryStatusPage';
import InventoryHistoryPage from '../../pages/InventoryHistoryPage';
import ProductionPlanPage from '../../pages/ProductionPlanPage';
import WorkOrderPage from '../../pages/WorkOrderPage';
import './TabLayout.css';

// 각 페이지가 유효한 컴포넌트인지 확인
// React 19에서는 memo 함수에 전달되는 인자가 컴포넌트인지 더 엄격하게 검사합니다.
const MemoizedDashboard = typeof DashboardPage === 'function' ? memo(DashboardPage) : DashboardPage;
const MemoizedCommonCode = typeof CommonCodePage === 'function' ? memo(CommonCodePage) : CommonCodePage;
const MemoizedFactoryManagement = typeof FactoryManagementPage === 'function' ? memo(FactoryManagementPage) : FactoryManagementPage;
const MemoizedLineManagement = typeof LineManagementPage === 'function' ? memo(LineManagementPage) : LineManagementPage;
const MemoizedEquipmentManagement = typeof EquipmentManagementPage === 'function' ? memo(EquipmentManagementPage) : EquipmentManagementPage;
const MemoizedCustomerManagement = typeof CustomerManagementPage === 'function' ? memo(CustomerManagementPage) : CustomerManagementPage;
const MemoizedWarehouseManagement = typeof WarehouseManagementPage === 'function' ? memo(WarehouseManagementPage) : WarehouseManagementPage;
const MemoizedMaterialManagement = typeof MaterialManagementPage === 'function' ? memo(MaterialManagementPage) : MaterialManagementPage;
const MemoizedHalfProductManagement = typeof HalfProductManagementPage === 'function' ? memo(HalfProductManagementPage) : HalfProductManagementPage;
const MemoizedProductManagement = typeof ProductManagementPage === 'function' ? memo(ProductManagementPage) : ProductManagementPage;
const MemoizedBomManagement = typeof BomManagementPage === 'function' ? memo(BomManagementPage) : BomManagementPage;
const MemoizedOrderRegistration = typeof OrderRegistrationPage === 'function' ? memo(OrderRegistrationPage) : OrderRegistrationPage;
const MemoizedShipmentManagement = typeof ShipmentManagementPage === 'function' ? memo(ShipmentManagementPage) : ShipmentManagementPage;
const MemoizedReceivingManagement = typeof ReceivingManagementPage === 'function' ? memo(ReceivingManagementPage) : ReceivingManagementPage;
const MemoizedOutboundManagement = typeof OutboundManagementPage === 'function' ? memo(OutboundManagementPage) : OutboundManagementPage;
const MemoizedInventoryStatus = typeof InventoryStatusPage === 'function' ? memo(InventoryStatusPage) : InventoryStatusPage;
const MemoizedInventoryHistory = typeof InventoryHistoryPage === 'function' ? memo(InventoryHistoryPage) : InventoryHistoryPage;
const MemoizedProductionPlan = typeof ProductionPlanPage === 'function' ? memo(ProductionPlanPage) : ProductionPlanPage;
const MemoizedWorkOrder = typeof WorkOrderPage === 'function' ? memo(WorkOrderPage) : WorkOrderPage;

// 각 탭 ID에 따라 적절한 컴포넌트를 렌더링하는 함수
const TabPanel = memo(({ tabId }) => {
  // 탭 ID에 따라 적절한 컴포넌트 렌더링
  switch(tabId) {
    case 'main':
      return <MemoizedDashboard />;
    case 'ci-common':
      return <MemoizedCommonCode />;
    case 'ci-factory':
      return <MemoizedFactoryManagement />;
    case 'ci-line':
      return <MemoizedLineManagement />;
    case 'ci-equipment':
      return <MemoizedEquipmentManagement />;
    case 'ci-customer':
      return <MemoizedCustomerManagement />;
    case 'ci-warehouse':
      return <MemoizedWarehouseManagement />;
    case 'pi-wip':
      return <MemoizedMaterialManagement />;
    case 'pi-half-product':
      return <MemoizedHalfProductManagement />;
    case 'pi-product':
      return <MemoizedProductManagement />;
    case 'pi-bom':
      return <MemoizedBomManagement />;
    case 'sm-order':
      return <MemoizedOrderRegistration />;
    case 'sm-sales':
      return <MemoizedShipmentManagement />;
    case 'mi-inbound':
      return <MemoizedReceivingManagement />;
    case 'mi-outbound':
      return <MemoizedOutboundManagement />;
    case 'mi-stock':
      return <MemoizedInventoryStatus />;
    case 'mi-stock-history':
      return <MemoizedInventoryHistory />;
    case 'pm-plan':
      return <MemoizedProductionPlan />;
    case 'pm-workorder':
      return <MemoizedWorkOrder />;
    // 다른 메뉴 항목들을 추가할 수 있습니다
    default:
      return <div>탭 컨텐츠를 찾을 수 없습니다</div>;
  }
});

// 개별 탭 컨텐츠 컴포넌트 - 메모이제이션 적용
const TabContent = memo(({ tabId, isActive, children }) => {
  return (
    <div 
      key={tabId} 
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
});

const TabLayout = () => {
  const { activeTab, tabContents, saveTabContent } = useTabs();
  // 렌더링된 탭 컴포넌트를 저장
  const [renderedTabs, setRenderedTabs] = useState({});

  // 현재 활성화된 탭이 아직 렌더링되지 않았을 때만 렌더링
  useEffect(() => {
    if (activeTab && !renderedTabs[activeTab]) {
      const newTabContent = <TabPanel tabId={activeTab} />;
      setRenderedTabs(prev => ({
        ...prev,
        [activeTab]: newTabContent
      }));
      saveTabContent(activeTab, true);
    }
  }, [activeTab, renderedTabs, saveTabContent]);

  // 더 이상 열려있지 않은 탭들의 렌더링 상태 제거
  useEffect(() => {
    // tabContents에 없는 탭은 renderedTabs에서도 제거
    setRenderedTabs(prev => {
      const newRenderedTabs = { ...prev };
      Object.keys(newRenderedTabs).forEach(tabId => {
        if (!tabContents[tabId]) {
          delete newRenderedTabs[tabId];
        }
      });
      return newRenderedTabs;
    });
  }, [tabContents]);

  return (
    <div className="tab-layout">
      <div className="tab-content">
        {/* 모든 탭 컨텐츠를 렌더링하되 현재 활성화된 탭만 표시 */}
        {Object.keys(renderedTabs).map(tabId => (
          <TabContent 
            key={tabId}
            tabId={tabId}
            isActive={activeTab === tabId}
          >
            {renderedTabs[tabId]}
          </TabContent>
        ))}
      </div>
    </div>
  );
};

export default memo(TabLayout); 
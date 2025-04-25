import React, { useState, useEffect, memo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useTabs } from '../../contexts/TabContext';
import { Element, scroller } from 'react-scroll';
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
import ProductionResultPage from '../../pages/ProductionResultPage';
import ProductionResultInquiryPage from '../../pages/ProductionResultInquiryPage';
import DefectInquiryPage from '../../pages/DefectInquiryPage';
import NoticeBoard from '../../pages/NoticeBoard';
import AuthorityManagementPage from '../../pages/AuthorityManagementPage';
import UserManagementPage from '../../pages/UserManagementPage';
import CompanyInfoPage from '../../pages/CompanyInfoPage';
import MenuManagement from '../System/MenuManagement';
import PlanVsActualPage from '../../pages/Report/PlanVsActualPage';
import PeriodicProductionPage from '../../pages/Report/PeriodicProductionPage';
import DefectRatePage from '../../pages/Report/DefectRatePage';
import InventoryMovementPage from '../../pages/Report/InventoryMovementPage';
import DailyProductionPage from '../../pages/Report/DailyProductionPage';
import './TabLayout.css';
import IntegratedMonitoringPage from "../../pages/Monitoring/IntegratedMonitoringPage";
import KPIMonitoringPage from "../../pages/Monitoring/KPIMonitoringPage";

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
const MemoizedProductionResult = typeof ProductionResultPage === 'function' ? memo(ProductionResultPage) : ProductionResultPage;
const MemoizedProductionResultInquiry = typeof ProductionResultInquiryPage === 'function' ? memo(ProductionResultInquiryPage) : ProductionResultInquiryPage;
const MemoizedDefectInquiry = typeof DefectInquiryPage === 'function' ? memo(DefectInquiryPage) : DefectInquiryPage;
const MemoizedNoticeBoard = typeof NoticeBoard === 'function' ? memo(NoticeBoard) : NoticeBoard;
const MemoizedAuthorityManagement = typeof AuthorityManagementPage === 'function' ? memo(AuthorityManagementPage) : AuthorityManagementPage;
const MemoizedUserManagement = typeof UserManagementPage === 'function' ? memo(UserManagementPage) : UserManagementPage;
const MemoizedCompanyInfo = typeof CompanyInfoPage === 'function' ? memo(CompanyInfoPage) : CompanyInfoPage;
const MemoizedMenuManagement = typeof MenuManagement === 'function' ? memo(MenuManagement) : MenuManagement;
const MemoizedPlanVsActual = typeof PlanVsActualPage === 'function' ? memo(PlanVsActualPage) : PlanVsActualPage;
const MemoizedPeriodicProduction = typeof PeriodicProductionPage === 'function' ? memo(PeriodicProductionPage) : PeriodicProductionPage;
const MemoizedDefectRate = typeof DefectRatePage === 'function' ? memo(DefectRatePage) : DefectRatePage;
const MemoizedInventoryMovement = typeof InventoryMovementPage === 'function' ? memo(InventoryMovementPage) : InventoryMovementPage;
const MemoizedDailyProduction = typeof DailyProductionPage === 'function' ? memo(DailyProductionPage) : DailyProductionPage;
const MemoizedIntegratedMonitoring = typeof IntegratedMonitoringPage === 'function' ? memo(IntegratedMonitoringPage) : IntegratedMonitoringPage;
const MemoizedKPIMonitoring = typeof KPIMonitoringPage === 'function' ? memo(KPIMonitoringPage) : KPIMonitoringPage;

// 각 탭 ID에 따라 적절한 컴포넌트를 생성하는 함수
const getTabComponent = (tabId) => {
  // 탭 ID에 따라 적절한 컴포넌트 반환
  switch(tabId) {
    case 'main':
      return <MemoizedDashboard tabId={tabId} />;
    case 'ci-common':
      return <MemoizedCommonCode tabId={tabId} />;
    case 'ci-factory':
      return <MemoizedFactoryManagement tabId={tabId} />;
    case 'ci-line':
      return <MemoizedLineManagement tabId={tabId} />;
    case 'ci-equipment':
      return <MemoizedEquipmentManagement tabId={tabId} />;
    case 'ci-customer':
      return <MemoizedCustomerManagement tabId={tabId} />;
    case 'ci-warehouse':
      return <MemoizedWarehouseManagement tabId={tabId} />;
    case 'pi-material-management':
      return <MemoizedMaterialManagement tabId={tabId} />;
    case 'pi-half-product':
      return <MemoizedHalfProductManagement tabId={tabId} />;
    case 'pi-product':
      return <MemoizedProductManagement tabId={tabId} />;
    case 'pi-bom':
      return <MemoizedBomManagement tabId={tabId} />;
    case 'sm-order':
      return <MemoizedOrderRegistration tabId={tabId} />;
    case 'sm-sales':
      return <MemoizedShipmentManagement tabId={tabId} />;
    case 'mi-inbound':
      return <MemoizedReceivingManagement tabId={tabId} />;
    case 'mi-outbound':
      return <MemoizedOutboundManagement tabId={tabId} />;
    case 'mi-stock':
      return <MemoizedInventoryStatus tabId={tabId} />;
    case 'mi-stock-history':
      return <MemoizedInventoryHistory tabId={tabId} />;
    case 'mm-plan':
      return <MemoizedProductionPlan tabId={tabId} />;
    case 'mm-workorder':
      return <MemoizedWorkOrder tabId={tabId} />;
    case 'mm-result-in':
      return <MemoizedProductionResult tabId={tabId} />;
    case 'mm-result':
      return <MemoizedProductionResultInquiry tabId={tabId} />;
    case 'mm-defect':
      return <MemoizedDefectInquiry tabId={tabId} />;
    case 'sy-notice':
      return <MemoizedNoticeBoard tabId={tabId} />
    case 'sy-authority':
      return <MemoizedAuthorityManagement tabId={tabId} />;
    case 'sy-user':
      return <MemoizedUserManagement tabId={tabId} />;
    case 'sy-company':
      return <MemoizedCompanyInfo tabId={tabId} />;
    case 'sy-menu':
      return <MemoizedMenuManagement tabId={tabId} />;
    case 'rp-mpv':
      return <MemoizedPlanVsActual tabId={tabId} />;
    case 'rp-ppr':
      return <MemoizedPeriodicProduction tabId={tabId} />;
    case 'rp-dpr':
      return <MemoizedDefectRate tabId={tabId} />;
    case 'rp-imr':
      return <MemoizedInventoryMovement tabId={tabId} />;
    case 'rp-dr':
      return <MemoizedDailyProduction tabId={tabId} />;
    case 'mo-integrated':
      return <MemoizedIntegratedMonitoring tabId={tabId} />;
    case 'mo-kpi':
      return <MemoizedKPIMonitoring tabId={tabId} />;
    // 다른 메뉴 항목들을 추가할 수 있습니다
    default:
      console.warn(`No component found for tab ID: ${tabId}`);
      return <div>탭 컨텐츠를 찾을 수 없습니다 ({tabId})</div>;
  }
};

// 개별 탭 컨텐츠 컴포넌트 - 각 탭을 isolation: isolate로 완전히 독립적인 stacking context로 만듦
const TabContent = memo(({ tabId, isActive, children, onRef }) => {
  // 탭 컨텐츠의 DOM 참조를 저장
  const contentRef = useRef(null);
  
  // 컴포넌트가 마운트되었을 때 ref 콜백 호출
  useEffect(() => {
    if (contentRef.current && onRef) {
      onRef(contentRef.current);
    }
  }, [onRef]);
  
  return (
    <Element 
      name={`tab-content-${tabId}`}
      className="tab-content-item"
      style={{ 
        visibility: isActive ? 'visible' : 'hidden', // display 대신 visibility 사용
        position: isActive ? 'relative' : 'absolute', // 비활성 탭은 absolute로 공간에서 제외
        zIndex: isActive ? 1 : -1, // 활성 탭만 보이도록 z-index 조정
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        isolation: 'isolate',
        overflow: 'auto',
        minHeight: '500px',
        top: 0,
        left: 0
      }}
      data-tab-id={tabId}
      ref={contentRef}
    >
      {children}
    </Element>
  );
});

const TabLayout = (props) => {
  const { activeTab, tabContents, saveTabContent, scrollToTab } = useTabs();
  // 각 탭 컴포넌트의 참조를 저장하는 상태
  const [tabComponents, setTabComponents] = useState({});
  
  // DOM 참조를 저장하는 객체 (단순한 refs 저장용)
  const tabRefs = useRef({});
  
  // 탭 컨텐츠의 DOM 참조를 저장하는 콜백 - 단순화
  const handleTabRef = useCallback((tabId) => (ref) => {
    if (ref && ref instanceof Element) {
      tabRefs.current[tabId] = ref;
    }
  }, []);

  // 탭 상태 관리 마운트 시 효과 (단순화) - 언마운트 시에만 실행
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 상태 저장 (단순히 isLoaded 상태만 관리)
      Object.keys(tabRefs.current).forEach(tabId => {
        if (tabRefs.current[tabId]) {
          saveTabContent(tabId, true);
        }
      });
    };
  }, [saveTabContent]);

  // 새 탭이 열릴 때 해당 탭의 컴포넌트 생성 - 개선된 로직
  useEffect(() => {
    let hasNewComponent = false;
    
    Object.keys(tabContents).forEach(tabId => {
      // 아직 해당 탭의 컴포넌트가 없다면 생성
      if (!tabComponents[tabId]) {
        hasNewComponent = true;
        console.log(`Creating component for tab: ${tabId}`);
        
        // 모든 경우에 새 컴포넌트 생성 방식 사용
        const component = getTabComponent(tabId);
        setTabComponents(prev => ({
          ...prev,
          [tabId]: component
        }));
      }
    });
    
    // 컴포넌트가 실제로 생성되었을 때만 saveTabContent 호출
    if (hasNewComponent) {
      // 상태 업데이트 후 실행되도록 setTimeout 사용 (지연 시간 증가)
      const timer = setTimeout(() => {
        // tabComponents 의존성 제거를 위해 현재 탭 컨텐츠로 직접 처리
        Object.keys(tabContents).forEach(tabId => {
          // 단순히 탭이 존재하는지만 확인하고 상태 저장
          saveTabContent(tabId, true);
        });
        
        // 명시적으로 두 번의 리사이즈 이벤트 발생
        // 1. 첫 번째: 빠른 DOM 업데이트 이후
        const resizeEvent1 = new Event('resize');
        window.dispatchEvent(resizeEvent1);
        
        // 2. 두 번째: 지연 후 완전한 렌더링 보장
        setTimeout(() => {
          const resizeEvent2 = new Event('resize');
          window.dispatchEvent(resizeEvent2);
          
          // 로깅
          console.log('Grid size recalculation triggered for new tabs');
        }, 300);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [tabContents, saveTabContent]);

  // 닫힌 탭의 컴포넌트 참조 제거 (메모리 관리)
  useEffect(() => {
    setTabComponents(prev => {
      const newComponents = { ...prev };
      Object.keys(newComponents).forEach(tabId => {
        if (!tabContents[tabId]) {
          console.log(`Removing component for tab: ${tabId}`);
          delete newComponents[tabId];
        }
      });
      return newComponents;
    });
  }, [tabContents]);

  // activeTab이 변경될 때 해당 탭으로 스크롤하고 크기 재계산 (개선된 버전)
  useEffect(() => {
    if (activeTab) {
      // 지연시켜 실행하여 DOM이 완전히 렌더링된 후 스크롤되도록 함
      const timer = setTimeout(() => {
        scrollToTab(activeTab);
        
        // 다중 리사이즈 이벤트로 안정적인 그리드 초기화 보장
        // 첫 번째 이벤트 - 즉시
        const resizeEvent1 = new Event('resize');
        window.dispatchEvent(resizeEvent1);
        
        // 두 번째 이벤트 - 약간 지연
        setTimeout(() => {
          const resizeEvent2 = new Event('resize');
          window.dispatchEvent(resizeEvent2);
          console.log(`Tab ${activeTab} activated, grid size recalculated`);
        }, 200);
        
        // 세 번째 이벤트 - 더 긴 지연으로 DOM이 완전히 로드된 후 확실히 재계산
        setTimeout(() => {
          const resizeEvent3 = new Event('resize');
          window.dispatchEvent(resizeEvent3);
        }, 500);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, scrollToTab]);

  return (
    <Element className="tab-layout" name="tab-layout">
      <Element className="tab-content" name="tab-content" id="tab-content">
        {/* 각 탭 컴포넌트 렌더링 */}
        {Object.keys(tabComponents).map(tabId => (
          <TabContent 
            key={tabId}
            tabId={tabId}
            isActive={activeTab === tabId}
            onRef={handleTabRef(tabId)}
          >
            {tabComponents[tabId]}
          </TabContent>
        ))}
      </Element>
    </Element>
  );
};

export default memo(TabLayout); 
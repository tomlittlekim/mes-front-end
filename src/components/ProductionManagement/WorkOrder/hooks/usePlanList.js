import { useCallback, useMemo } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { gql } from '@apollo/client';
import Message from '../../../../utils/message/Message';

/**
 * 생산계획 목록 관련 기능 제공 커스텀 훅
 *
 * @param {Function} setPlanList - 생산계획 목록 상태 설정 함수
 * @param {Function} setIsLoading - 로딩 상태 설정 함수
 * @param {Function} setRefreshKey - 새로고침 키 설정 함수
 * @param {Function} formatPlanGridData - 생산계획 데이터 포맷 함수
 * @returns {Object} 생산계획 관련 함수들
 */
export const usePlanList = (setPlanList, setIsLoading, setRefreshKey, formatPlanGridData) => {
  const { executeQuery } = useGraphQL();

  // GraphQL 쿼리 정의
  const PRODUCTION_PLANS_QUERY = gql`
      query getProductionPlans($filter: ProductionPlanFilter) {
          productionPlans(filter: $filter) {
              site
              compCd
              prodPlanId
              productId
              planQty
              shiftType
              planStartDate
              planEndDate
              flagActive
              createUser
              createDate
              updateUser
              updateDate
          }
      }
  `;

  // 생산계획 목록 조회 함수
  const fetchPlanList = useCallback((filterData = {}) => {
    setIsLoading(true);

    executeQuery(PRODUCTION_PLANS_QUERY, { filter: filterData })
    .then(response => {
      if (response.data) {
        const formattedData = formatPlanGridData(response.data);
        setPlanList(formattedData);
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching production plans:", error);
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
      setIsLoading(false);
      setPlanList([]);
    });
  }, [executeQuery, PRODUCTION_PLANS_QUERY, formatPlanGridData, setPlanList, setIsLoading, setRefreshKey]);

  // 생산계획 목록 그리드 컬럼 정의
  // 참고: 주문번호(orderId) 필드 제거됨
  const planColumns = useMemo(() => {
    // 컬럼 정의는 components/PlanList.js로 이동
    return [];
  }, []);

  return {
    fetchPlanList,
    planColumns,
    PRODUCTION_PLANS_QUERY
  };
};

export default usePlanList;
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useDomain, DOMAINS } from '../../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGridRow } from '../../../../utils/grid/useGridRow';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { gql } from '@apollo/client';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import Message from '../../../../utils/message/Message';

/**
 * 작업지시관리 기능 제공 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 작업지시 관리에 필요한 상태 및 함수들
 */
export const useWorkOrderManagement = (tabId) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

  // React Hook Form 설정
  const { reset, handleSubmit, setValue } = useForm({
    defaultValues: {
      prodPlanId: '',
      productId: '',
      productName: '',
      materialCategory: '',
      planStartDateRange: {
        startDate: null,
        endDate: null
      },
      planEndDateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [planList, setPlanList] = useState([]);
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [productMaterials, setProductMaterials] = useState([]);

  // 그리드 유틸리티 훅 사용
  const { formatDateToYYYYMMDD, generateId } = useGridUtils();

  // GraphQL 훅 사용
  const { executeQuery, executeMutation } = useGraphQL();

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

  const WORK_ORDERS_BY_PLAN_QUERY = gql`
      query getWorkOrdersByProdPlanId($prodPlanId: String!) {
          workOrdersByProdPlanId(prodPlanId: $prodPlanId) {
              site
              compCd
              workOrderId
              prodPlanId
              productId
              orderQty
              shiftType
              state
              flagActive
              createUser
              createDate
              updateUser
              updateDate
          }
      }
  `;

  const SAVE_WORK_ORDER_MUTATION = gql`
      mutation SaveWorkOrder($createdRows: [WorkOrderInput], $updatedRows: [WorkOrderUpdate]) {
          saveWorkOrder(createdRows: $createdRows, updatedRows: $updatedRows)
      }
  `;

  const DELETE_WORK_ORDERS_MUTATION = gql`
      mutation DeleteWorkOrders($workOrderIds: [String!]!) {
          deleteWorkOrders(workOrderIds: $workOrderIds) {
              success
              totalRequested
              deletedCount
              skippedCount
              skippedWorkOrders
              message
          }
      }
  `;

  const START_WORK_ORDERS_MUTATION = gql`
      mutation StartWorkOrders($workOrderIds: [String!]!) {
          startWorkOrders(workOrderIds: $workOrderIds) {
              success
              totalRequested
              processedCount
              skippedCount
              skippedWorkOrders
              message
          }
      }
  `;

  const COMPLETE_WORK_ORDERS_MUTATION = gql`
      mutation CompleteWorkOrders($workOrderIds: [String!]!) {
          completeWorkOrders(workOrderIds: $workOrderIds) {
              success
              totalRequested
              processedCount
              skippedCount
              skippedWorkOrders
              message
          }
      }
  `;

  const MATERIALS_QUERY = gql`
      query getAllMaterials {
          getAllMaterials {
              materialType
              categories {
                  materialCategory
                  materials {
                      systemMaterialId
                      userMaterialId
                      materialName
                      materialStandard
                      unit
                      materialType
                      materialCategory
                  }
              }
          }
      }
  `;

  // 새 작업지시 행 생성 함수
  const createNewWorkOrder = useCallback(() => {
    const currentDate = new Date();
    const currentUser = loginUser.loginId;
    const newId = generateId();

    // 선택된 생산계획이 없으면 기본값 사용
    if (!selectedPlan) {
      return {
        id: newId,
        workOrderId: '자동입력',
        prodPlanId: '',
        productId: '',
        orderQty: 0,
        shiftType: 'DAY',
        state: 'PLANNED', // 기본값
        flagActive: true,
        createUser: currentUser,
        createDate: currentDate,
        updateUser: currentUser,
        updateDate: currentDate
      };
    }

    // 선택된 생산계획의 정보를 그대로 사용
    return {
      id: newId,
      workOrderId: '자동입력',
      prodPlanId: selectedPlan.prodPlanId,
      productId: selectedPlan.productId,
      orderQty: selectedPlan.planQty,
      shiftType: selectedPlan.shiftType || 'DAY',
      state: 'PLANNED', // 기본값
      flagActive: true,
      createUser: currentUser,
      createDate: currentDate,
      updateUser: currentUser,
      updateDate: currentDate
    };
  }, [loginUser, generateId, selectedPlan]);

  // 작업지시 그리드 행 관련 커스텀 훅 사용
  const {
    addRows,
    updatedRows,
    setAddRows,
    setUpdatedRows,
    resetRows
  } = useGridRow({
    createNewRow: createNewWorkOrder,
    formatNewRow: (row) => ({
      prodPlanId: row.prodPlanId || '',
      productId: row.productId || '',
      orderQty: parseFloat(row.orderQty) || 0,
      shiftType: row.shiftType || 'DAY',
      state: row.state || 'PLANNED',
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    }),
    formatUpdatedRow: (row) => ({
      workOrderId: row.workOrderId,
      prodPlanId: row.prodPlanId || '',
      productId: row.productId || '',
      orderQty: parseFloat(row.orderQty) || 0,
      shiftType: row.shiftType || 'DAY',
      state: row.state || 'PLANNED',
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    })
  });

  // 생산계획 데이터 포맷 함수
  const formatPlanGridData = useCallback((data) => {
    if (!data?.productionPlans) {
      return [];
    }

    return data.productionPlans.map((plan) => ({
      ...plan,
      id: plan.prodPlanId,
      planQty: plan.planQty ? Number(plan.planQty) : 0,
      planStartDate: plan.planStartDate ? new Date(plan.planStartDate) : null,
      planEndDate: plan.planEndDate ? new Date(plan.planEndDate) : null,
      createDate: plan.createDate ? new Date(plan.createDate) : null,
      updateDate: plan.updateDate ? new Date(plan.updateDate) : null
    }));
  }, []);

  // 작업지시 데이터 포맷 함수
  const formatWorkOrderGridData = useCallback((data) => {
    if (!data?.workOrders && !data?.workOrdersByProdPlanId) {
      return [];
    }

    const workOrders = data.workOrders || data.workOrdersByProdPlanId || [];

    return workOrders.map((order) => ({
      ...order,
      id: order.workOrderId,
      orderQty: order.orderQty ? Number(order.orderQty) : 0,
      createDate: order.createDate ? new Date(order.createDate) : null,
      updateDate: order.updateDate ? new Date(order.updateDate) : null
    }));
  }, []);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setIsLoading(true);
    setUpdatedRows([]);
    setAddRows([]);
    setSelectedPlan(null);
    setSelectedWorkOrder(null);
    setWorkOrderList([]);

    // 날짜 형식 변환 - null 값도 허용
    const filterData = {...data};

    // planStartDateRange 객체에서 시작일 범위를 추출하여 필터 데이터로 변환
    if (filterData.planStartDateRange) {
      if (filterData.planStartDateRange.startDate) {
        filterData.planStartDateFrom = format(filterData.planStartDateRange.startDate, 'yyyy-MM-dd');
      }
      if (filterData.planStartDateRange.endDate) {
        filterData.planStartDateTo = format(filterData.planStartDateRange.endDate, 'yyyy-MM-dd');
      }
      delete filterData.planStartDateRange;
    }

    // planEndDateRange 객체에서 종료일 범위를 추출하여 필터 데이터로 변환
    if (filterData.planEndDateRange) {
      if (filterData.planEndDateRange.startDate) {
        filterData.planEndDateFrom = format(filterData.planEndDateRange.startDate, 'yyyy-MM-dd');
      }
      if (filterData.planEndDateRange.endDate) {
        filterData.planEndDateTo = format(filterData.planEndDateRange.endDate, 'yyyy-MM-dd');
      }
      delete filterData.planEndDateRange;
    }

    // productName 값이 있으면 productId로 설정
    if (filterData.productName) {
      filterData.productId = filterData.productName;
      delete filterData.productName;
    }

    // state 필드 처리 - 값이 있으면 배열로 변환
    if (filterData.state) {
      filterData.state = [filterData.state]; // 단일 값을 배열로 변환
    }

    // productName 값이 있으면, 해당 제품명과 일치하는 제품들의 systemMaterialId를 찾아 필터링
    if (filterData.productName && productMaterials.length > 0) {
      const matchingProducts = productMaterials.filter(m => 
        m.materialName?.toLowerCase().includes(filterData.productName.toLowerCase())
      );
      
      if (matchingProducts.length > 0) {
        // 일치하는 제품들의 systemMaterialId를 배열로 만들어 필터에 추가
        const matchingProductIds = matchingProducts.map(m => m.systemMaterialId);
        // 이미 productId 값이 있으면 교집합으로 필터링
        if (filterData.productId) {
          const currentProductId = filterData.productId;
          if (matchingProductIds.includes(currentProductId)) {
            // 기존 productId가 matchingProductIds에 포함되면 그대로 유지
            filterData.productId = currentProductId;
          } else {
            // 일치하는 항목이 없으면 빈 결과가 나오도록 존재하지 않는 ID 설정
            filterData.productId = 'NO_MATCH_PRODUCT_ID';
          }
        } else {
          // productId 값이 없었으면 matchingProductIds 중 하나라도 일치하면 결과에 포함되도록 설정
          filterData.productIds = matchingProductIds;
        }
      } else {
        // 일치하는 제품이 없으면 빈 결과가 나오도록 존재하지 않는 ID 설정
        filterData.productId = 'NO_MATCH_PRODUCT_ID';
      }
      // 검색 후에는 제품명 조건 제거
      delete filterData.productName;
    }

    // 생산계획 검색
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
  }, [executeQuery, PRODUCTION_PLANS_QUERY, formatPlanGridData, setUpdatedRows, setAddRows, reset, productMaterials]);

  // 초기화 함수
  const handleReset = useCallback(() => {
    // 초기화 후 검색 실행
    handleSearch({
      prodPlanId: '',
      productId: '',
      productName: '',
      materialCategory: '',
      planStartDateRange: { startDate: null, endDate: null },
      planEndDateRange: { startDate: null, endDate: null }
    });
  }, [handleSearch]);

  // 계획 선택 핸들러
  const handlePlanSelect = useCallback((params) => {
    const plan = planList.find(p => p.id === params.id);
    setSelectedPlan(plan);
    setSelectedWorkOrder(null);

    if (plan && plan.prodPlanId) {
      // 선택한 생산계획의 작업지시 조회
      executeQuery(WORK_ORDERS_BY_PLAN_QUERY, { prodPlanId: plan.prodPlanId })
      .then(response => {
        if (response.data) {
          const formattedData = formatWorkOrderGridData(response.data);
          setWorkOrderList(formattedData);
        }
      })
      .catch(error => {
        console.error("Error fetching work orders:", error);
        Message.showError({ message: '작업지시 데이터를 불러오는데 실패했습니다.' });
        setWorkOrderList([]);
      });
    } else {
      setWorkOrderList([]);
    }
  }, [planList, executeQuery, WORK_ORDERS_BY_PLAN_QUERY, formatWorkOrderGridData]);

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    setSelectedWorkOrder(workOrder);
  }, [workOrderList]);

  // 행 업데이트 처리 핸들러
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const isNewRow = oldRow.id.startsWith('NEW_');

    // 깊은 복제로 원본 데이터 보존
    const processedRow = {...newRow};

    // orderQty 필드 명시적 처리
    if (processedRow.orderQty === undefined || processedRow.orderQty === null || processedRow.orderQty === '') {
      processedRow.orderQty = 0;
    } else if (typeof processedRow.orderQty === 'string') {
      // 문자열인 경우 숫자로 변환
      processedRow.orderQty = Number(processedRow.orderQty.replace(/,/g, ''));
      if (isNaN(processedRow.orderQty)) {
        processedRow.orderQty = 0;
      }
    }
    
    // 수량 변경 시 생산계획 수량 초과 검증
    if (selectedPlan && processedRow.prodPlanId === selectedPlan.prodPlanId) {
      const planQty = selectedPlan.planQty || 0;
      const oldQty = parseFloat(oldRow.orderQty) || 0;
      const newQty = parseFloat(processedRow.orderQty) || 0;
      const qtyDiff = newQty - oldQty;
      
      if (qtyDiff > 0) {
        // 현재 계획에 속한 모든 작업지시 수량의 합 계산
        const currentTotal = workOrderList
          .filter(wo => wo.prodPlanId === selectedPlan.prodPlanId)
          .reduce((sum, wo) => {
            // 현재 편집 중인 행은 제외하고 합산
            if (wo.id === oldRow.id) {
              return sum;
            }
            return sum + (parseFloat(wo.orderQty) || 0);
          }, 0);
          
        // 신규 수량 포함 전체 합계
        const totalWithNew = currentTotal + newQty;
        
        if (totalWithNew > planQty) {
          Message.showWarning(`작업지시수량의 합(${totalWithNew})이 생산계획수량(${planQty})을 초과할 수 없습니다.`);
          return oldRow; // 변경 거부, 원래 값 유지
        }
      }
    }

    // 그리드 상태 업데이트
    setWorkOrderList((prev) => {
      return prev.map((row) => row.id === oldRow.id ? {...row, ...processedRow} : row);
    });

    if (isNewRow) {
      setAddRows((prevAddRows) => {
        const existingIndex = prevAddRows.findIndex(row => row.id === oldRow.id);
        if (existingIndex !== -1) {
          const updatedRows = [...prevAddRows];
          updatedRows[existingIndex] = {...updatedRows[existingIndex], ...processedRow};
          return updatedRows;
        } else {
          return [...prevAddRows, processedRow];
        }
      });
    } else {
      setUpdatedRows((prevUpdatedRows) => {
        const existingIndex = prevUpdatedRows.findIndex(row => row.workOrderId === oldRow.workOrderId);
        if (existingIndex !== -1) {
          const updatedRows = [...prevUpdatedRows];
          updatedRows[existingIndex] = {...updatedRows[existingIndex], ...processedRow};
          return updatedRows;
        } else {
          return [...prevUpdatedRows, processedRow];
        }
      });
    }

    return processedRow;
  }, [setAddRows, setUpdatedRows, workOrderList, selectedPlan]);

  // 등록 버튼 클릭 핸들러
  const handleAddWorkOrder = useCallback(() => {
    if (!selectedPlan) {
      Message.showWarning('작업지시를 등록하려면 먼저 생산계획을 선택해주세요.');
      return;
    }

    const newRow = createNewWorkOrder();
    setWorkOrderList(prev => [newRow, ...prev]);
    setAddRows(prev => [newRow, ...prev]);
  }, [createNewWorkOrder, setAddRows, selectedPlan]);

  // 저장 버튼 클릭 핸들러
  const handleSaveWorkOrder = useCallback(() => {
    // 신규 추가 행 필터링
    const newRows = workOrderList.filter(row => row.id.startsWith('NEW_'));

    if (newRows.length === 0 && updatedRows.length === 0) {
      Message.showWarning('저장할 데이터가 없습니다.');
      return;
    }

    // 필수 필드 검증 함수
    const validateRequiredFields = (rows, fieldNames) => {
      for (const row of rows) {
        for (const field of fieldNames) {
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            Message.showError({ message: `${field} 필드는 필수 입력값입니다.` });
            return false;
          }
        }
      }
      return true;
    };

    // 필수 필드 검증
    const requiredFields = ['productId', 'prodPlanId'];
    if (!validateRequiredFields(newRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }
    
    // 생산계획수량 초과 검증
    if (selectedPlan) {
      const planId = selectedPlan.prodPlanId;
      const planQty = selectedPlan.planQty || 0;
      
      // 현재 선택한 생산계획에 해당하는 작업지시만 필터링
      const existingWorkOrders = workOrderList.filter(wo => 
        wo.prodPlanId === planId && !wo.id.startsWith('NEW_') && wo.id !== selectedWorkOrder?.id
      );
      
      // 기존 작업지시들의 수량 합계
      const existingTotal = existingWorkOrders.reduce((sum, wo) => sum + (parseFloat(wo.orderQty) || 0), 0);
      
      // 신규 추가 작업지시들 중 현재 계획에 해당하는 것들만 필터링
      const newWorkOrders = newRows.filter(wo => wo.prodPlanId === planId);
      
      // 신규 작업지시들의 수량 합계
      const newTotal = newWorkOrders.reduce((sum, wo) => sum + (parseFloat(wo.orderQty) || 0), 0);
      
      // 수정된 기존 작업지시들 중 현재 계획에 해당하는 것들만 필터링
      const updatedWorkOrders = workOrderList.filter(wo => 
        wo.prodPlanId === planId && 
        updatedRows.some(ur => ur.workOrderId === wo.workOrderId)
      );
      
      // 수정된 작업지시들의 수량 합계
      const updatedTotal = updatedWorkOrders.reduce((sum, wo) => sum + (parseFloat(wo.orderQty) || 0), 0);
      
      // 기존 작업지시들 중 수정되지 않은 것들의 수량 합계
      const unchangedTotal = existingWorkOrders
        .filter(wo => !updatedWorkOrders.some(uo => uo.workOrderId === wo.workOrderId))
        .reduce((sum, wo) => sum + (parseFloat(wo.orderQty) || 0), 0);
      
      // 전체 작업지시 수량 합계 계산
      const totalOrderQty = newTotal + updatedTotal + unchangedTotal;
      
      // 작업지시 수량 합계가 생산계획수량을 초과하는지 검증
      if (totalOrderQty > planQty) {
        Message.showError({ 
          message: `작업지시수량의 합(${totalOrderQty})이 생산계획수량(${planQty})을 초과할 수 없습니다.` 
        });
        return;
      }
    }

    // 생성할 행 변환
    const createdWorkOrderInputs = newRows.map(row => ({
      prodPlanId: row.prodPlanId || '',
      productId: row.productId || '',
      orderQty: parseFloat(row.orderQty) || 0,
      shiftType: row.shiftType || 'DAY',
      state: row.state || 'PLANNED'
      // flagActive 필드 제거 (기본값 true 사용)
    }));

    // 업데이트할 행 변환 - flagActive 필드 제거
    const updatedWorkOrderInputs = updatedRows.map(updatedRow => {
      // 그리드에서 최신 데이터 찾기
      const currentRow = workOrderList.find(row => row.workOrderId === updatedRow.workOrderId) || updatedRow;

      return {
        workOrderId: currentRow.workOrderId,
        prodPlanId: currentRow.prodPlanId || '',
        productId: currentRow.productId || '',
        orderQty: parseFloat(currentRow.orderQty) || 0,
        shiftType: currentRow.shiftType || 'DAY',
        state: currentRow.state || 'PLANNED'
        // flagActive 필드 제거 (수정 불가)
      };
    });

    // API 호출
    executeMutation(SAVE_WORK_ORDER_MUTATION, {
      createdRows: createdWorkOrderInputs,
      updatedRows: updatedWorkOrderInputs,
    })
    .then((result) => {
      // 저장 성공 후 상태 초기화
      setAddRows([]);
      setUpdatedRows([]);
      // 저장 성공 메시지와 함께 데이터 새로고침
      Message.showSuccess(Message.SAVE_SUCCESS, () => {
        if (selectedPlan) {
          // 선택된 생산계획이 있으면 해당 생산계획의 작업지시만 다시 불러옴
          executeQuery(WORK_ORDERS_BY_PLAN_QUERY, { prodPlanId: selectedPlan.prodPlanId })
          .then(response => {
            if (response.data) {
              const formattedData = formatWorkOrderGridData(response.data);
              setWorkOrderList(formattedData);
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error saving work order:", error);
      let errorMessage = '저장 중 오류가 발생했습니다.';
      if (error?.graphQLErrors?.[0]?.message) {
        errorMessage = error.graphQLErrors[0].message;
      }
      Message.showError({ message: errorMessage });
    });
  }, [workOrderList, updatedRows, selectedPlan, setAddRows, setUpdatedRows, executeMutation, SAVE_WORK_ORDER_MUTATION, WORK_ORDERS_BY_PLAN_QUERY, executeQuery, formatWorkOrderGridData]);

  // 삭제 버튼 클릭 핸들러 - 다중 삭제 방식으로 변경
  const handleDeleteWorkOrder = useCallback((selectedRowIds) => {
    // selectedRowIds가 전달되지 않은 경우 기존 단일 선택 방식 호환성 유지
    let rowsToDelete = selectedRowIds;
    
    if (!rowsToDelete || rowsToDelete.length === 0) {
      // 기존 단일 선택 방식 호환성을 위해 selectedWorkOrder 확인
      if (selectedWorkOrder) {
        rowsToDelete = [selectedWorkOrder.id];
      } else {
        Message.showWarning('삭제할 작업지시를 선택해주세요.');
        return;
      }
    }

    // 선택된 행들 찾기
    const selectedRows = workOrderList.filter(workOrder => rowsToDelete.includes(workOrder.id));
    
    if (selectedRows.length === 0) {
      Message.showWarning('삭제할 작업지시를 선택해주세요.');
      return;
    }

    // 신규 추가된 행들과 기존 행들 분리
    const newRows = selectedRows.filter(row => row.id.toString().startsWith('NEW_'));
    const existingRows = selectedRows.filter(row => !row.id.toString().startsWith('NEW_'));

    // 신규 추가된 행들은 바로 목록에서만 삭제
    if (newRows.length > 0) {
      const newRowIds = newRows.map(row => row.id);
      const updatedList = workOrderList.filter(w => !newRowIds.includes(w.id));
      setWorkOrderList(updatedList);
      // 추가된 행 목록에서도 제거
      setAddRows(prev => prev.filter(w => !newRowIds.includes(w.id)));
      // 선택된 작업지시가 삭제된 행에 포함되어 있으면 선택 해제
      if (selectedWorkOrder && newRowIds.includes(selectedWorkOrder.id)) {
        setSelectedWorkOrder(null);
      }
    }

    // 기존 행들이 있는 경우 서버에서 삭제
    if (existingRows.length > 0) {
      const workOrderIds = existingRows.map(row => row.workOrderId);
      
      // 삭제 확인 메시지
      const confirmMessage = existingRows.length === 1 
        ? '선택한 작업지시를 삭제하시겠습니까?' 
        : `선택한 ${existingRows.length}개의 작업지시를 삭제하시겠습니까?`;
      
      Message.showDeleteConfirm(() => {
        executeMutation(DELETE_WORK_ORDERS_MUTATION, { workOrderIds })
        .then((response) => {
          const result = response.data.deleteWorkOrders;
          
          // 서버 응답이 성공이고 실제로 삭제된 항목이 있는 경우에만 UI에서 아이템 제거
          if (result.success && result.deletedCount > 0) {
            // 삭제된 행들을 목록에서 제거
            const deletedIds = existingRows.map(row => row.id);
            const updatedList = workOrderList.filter(w => !deletedIds.includes(w.id));
            setWorkOrderList(updatedList);
            
            // 선택된 작업지시가 삭제된 행에 포함되어 있으면 선택 해제
            if (selectedWorkOrder && deletedIds.includes(selectedWorkOrder.id)) {
              setSelectedWorkOrder(null);
            }
            
            // 성공 메시지 표시
            let message = `총 ${result.totalRequested}개 중 ${result.deletedCount}개가 삭제되었습니다.`;
            
            if (result.skippedCount > 0) {
              message += `\n${result.skippedCount}개는 생산실적이 존재하여 삭제할 수 없습니다.`;
              if (result.skippedWorkOrders && result.skippedWorkOrders.length > 0) {
                message += `\n삭제되지 않은 작업지시: ${result.skippedWorkOrders.join(', ')}`;
              }
              Message.showWarning(message);
            } else {
              Message.showSuccess(message);
            }
          } else {
            // 삭제 실패 시 에러 메시지 표시 (UI는 변경하지 않음)
            const errorMessage = result.message || '삭제 중 오류가 발생했습니다.';
            Message.showError({ message: errorMessage });
          }
        })
        .catch((error) => {
          console.error("Error deleting work orders:", error);
          let errorMessage = '삭제 중 오류가 발생했습니다.';
          if (error?.graphQLErrors?.[0]?.message) {
            errorMessage = error.graphQLErrors[0].message;
          }
          Message.showError({ message: errorMessage });
        });
      }, confirmMessage);
    } else if (newRows.length > 0) {
      // 신규 행만 삭제한 경우 성공 메시지
      Message.showSuccess(`${newRows.length}개의 신규 항목이 삭제되었습니다.`);
    }
  }, [workOrderList, selectedWorkOrder, setAddRows, executeMutation, DELETE_WORK_ORDERS_MUTATION]);

  // 작업 시작 핸들러 - 다중 처리 방식으로 변경
  const handleStartWork = useCallback((selectedRowIds) => {
    // selectedRowIds가 전달되지 않은 경우 기존 단일 선택 방식 호환성 유지
    let rowsToStart = selectedRowIds;
    
    if (!rowsToStart || rowsToStart.length === 0) {
      // 기존 단일 선택 방식 호환성을 위해 selectedWorkOrder 확인
      if (selectedWorkOrder) {
        rowsToStart = [selectedWorkOrder.id];
      } else {
        Message.showWarning('시작할 작업지시를 선택해주세요.');
        return;
      }
    }

    // 선택된 행들 찾기
    const selectedRows = workOrderList.filter(workOrder => rowsToStart.includes(workOrder.id));
    
    if (selectedRows.length === 0) {
      Message.showWarning('시작할 작업지시를 선택해주세요.');
      return;
    }

    // 신규 추가된 행들은 제외 (workOrderId가 없음)
    const existingRows = selectedRows.filter(row => 
      !row.id.toString().startsWith('NEW_') && row.workOrderId && row.workOrderId !== '자동입력'
    );

    if (existingRows.length === 0) {
      Message.showWarning('시작할 수 있는 작업지시가 없습니다. (신규 추가된 항목은 저장 후 시작 가능합니다)');
      return;
    }

    // 이미 진행 중이거나 완료된 작업지시 필터링
    const startableRows = existingRows.filter(row => 
      row.state === 'PLANNED'
    );

    if (startableRows.length === 0) {
      Message.showWarning('시작할 수 있는 작업지시가 없습니다. (계획됨 상태의 작업지시만 시작 가능합니다)');
      return;
    }

    const workOrderIds = startableRows.map(row => row.workOrderId);
    
    // 시작 확인 메시지
    const confirmMessage = startableRows.length === 1 
      ? `작업지시 [${startableRows[0].workOrderId}]를 시작하시겠습니까?`
      : `선택한 ${startableRows.length}개의 작업지시를 시작하시겠습니까?`;
    
    Message.showConfirm(
      '작업 시작',
      confirmMessage,
      () => {
        // 백엔드 API 호출하여 상태 변경
        executeMutation(START_WORK_ORDERS_MUTATION, { workOrderIds })
        .then((response) => {
          const result = response.data.startWorkOrders;
          
          if (result.success) {
            // 성공적으로 처리된 작업지시들의 상태를 'IN_PROGRESS'로 변경
            const processedWorkOrderIds = workOrderIds.filter(id => 
              !result.skippedWorkOrders.includes(id)
            );
            
            setWorkOrderList(prev =>
              prev.map(order => {
                if (processedWorkOrderIds.includes(order.workOrderId)) {
                  return { ...order, state: 'IN_PROGRESS' };
                }
                return order;
              })
            );

            // 선택된 작업지시가 처리된 경우 상태 업데이트
            if (selectedWorkOrder && processedWorkOrderIds.includes(selectedWorkOrder.workOrderId)) {
              setSelectedWorkOrder(prev => ({ ...prev, state: 'IN_PROGRESS' }));
            }
            
            // 결과에 따른 메시지 표시
            let message = `총 ${result.totalRequested}개 중 ${result.processedCount}개가 시작되었습니다.`;
            
            if (result.skippedCount > 0) {
              message += `\n${result.skippedCount}개는 시작할 수 없습니다.`;
              if (result.skippedWorkOrders && result.skippedWorkOrders.length > 0) {
                message += `\n시작되지 않은 작업지시: ${result.skippedWorkOrders.join(', ')}`;
              }
            }
            
            if (result.skippedCount > 0) {
              Message.showWarning(message);
            } else {
              Message.showSuccess(message);
            }
          } else {
            Message.showError({ message: result.message || '작업 시작 처리에 실패했습니다.' });
          }
        })
        .catch((error) => {
          console.error("Error starting work orders:", error);
          let errorMessage = '작업 시작 중 오류가 발생했습니다.';
          if (error?.graphQLErrors?.[0]?.message) {
            errorMessage = error.graphQLErrors[0].message;
          }
          Message.showError({ message: errorMessage });
        });
      }
    );
  }, [workOrderList, selectedWorkOrder, executeMutation, START_WORK_ORDERS_MUTATION]);

  // 작업 완료 핸들러 - 다중 처리 방식으로 변경
  const handleCompleteWork = useCallback((selectedRowIds) => {
    // selectedRowIds가 전달되지 않은 경우 기존 단일 선택 방식 호환성 유지
    let rowsToComplete = selectedRowIds;
    
    if (!rowsToComplete || rowsToComplete.length === 0) {
      // 기존 단일 선택 방식 호환성을 위해 selectedWorkOrder 확인
      if (selectedWorkOrder) {
        rowsToComplete = [selectedWorkOrder.id];
      } else {
        Message.showWarning('완료할 작업지시를 선택해주세요.');
        return;
      }
    }

    // 선택된 행들 찾기
    const selectedRows = workOrderList.filter(workOrder => rowsToComplete.includes(workOrder.id));
    
    if (selectedRows.length === 0) {
      Message.showWarning('완료할 작업지시를 선택해주세요.');
      return;
    }

    // 신규 추가된 행들은 제외 (workOrderId가 없음)
    const existingRows = selectedRows.filter(row => 
      !row.id.toString().startsWith('NEW_') && row.workOrderId && row.workOrderId !== '자동입력'
    );

    if (existingRows.length === 0) {
      Message.showWarning('완료할 수 있는 작업지시가 없습니다. (신규 추가된 항목은 저장 후 완료 가능합니다)');
      return;
    }

    // 이미 완료된 작업지시 필터링 (진행중 또는 계획됨 상태만 완료 가능)
    const completableRows = existingRows.filter(row => 
      row.state === 'IN_PROGRESS' || row.state === 'PLANNED'
    );

    if (completableRows.length === 0) {
      Message.showWarning('완료할 수 있는 작업지시가 없습니다. (계획됨 또는 진행중 상태의 작업지시만 완료 가능합니다)');
      return;
    }

    const workOrderIds = completableRows.map(row => row.workOrderId);
    
    // 완료 확인 메시지
    const confirmMessage = completableRows.length === 1 
      ? `작업지시 [${completableRows[0].workOrderId}]를 완료 처리하시겠습니까?`
      : `선택한 ${completableRows.length}개의 작업지시를 완료 처리하시겠습니까?`;
    
    Message.showConfirm(
      '작업 완료',
      confirmMessage,
      () => {
        // 백엔드 API 호출하여 상태 변경
        executeMutation(COMPLETE_WORK_ORDERS_MUTATION, { workOrderIds })
        .then((response) => {
          const result = response.data.completeWorkOrders;
          
          if (result.success) {
            // 성공적으로 처리된 작업지시들의 상태를 'COMPLETED'로 변경
            const processedWorkOrderIds = workOrderIds.filter(id => 
              !result.skippedWorkOrders.includes(id)
            );
            
            setWorkOrderList(prev =>
              prev.map(order => {
                if (processedWorkOrderIds.includes(order.workOrderId)) {
                  return { ...order, state: 'COMPLETED' };
                }
                return order;
              })
            );

            // 선택된 작업지시가 처리된 경우 상태 업데이트
            if (selectedWorkOrder && processedWorkOrderIds.includes(selectedWorkOrder.workOrderId)) {
              setSelectedWorkOrder(prev => ({ ...prev, state: 'COMPLETED' }));
            }
            
            // 결과에 따른 메시지 표시
            let message = `총 ${result.totalRequested}개 중 ${result.processedCount}개가 완료되었습니다.`;
            
            if (result.skippedCount > 0) {
              message += `\n${result.skippedCount}개는 완료할 수 없습니다.`;
              if (result.skippedWorkOrders && result.skippedWorkOrders.length > 0) {
                message += `\n완료되지 않은 작업지시: ${result.skippedWorkOrders.join(', ')}`;
              }
            }
            
            if (result.skippedCount > 0) {
              Message.showWarning(message);
            } else {
              Message.showSuccess(message);
            }
          } else {
            Message.showError({ message: result.message || '작업 완료 처리에 실패했습니다.' });
          }
        })
        .catch((error) => {
          console.error("Error completing work orders:", error);
          let errorMessage = '작업 완료 중 오류가 발생했습니다.';
          if (error?.graphQLErrors?.[0]?.message) {
            errorMessage = error.graphQLErrors[0].message;
          }
          Message.showError({ message: errorMessage });
        });
      }
    );
  }, [workOrderList, selectedWorkOrder, executeMutation, COMPLETE_WORK_ORDERS_MUTATION]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((fieldName, startDate, endDate) => {
    setValue(fieldName, { startDate, endDate });
  }, [setValue]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 컴포넌트 마운트 시에만 초기 데이터 로드
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
          // 초기 빈 검색 조건으로 데이터 로드
          const filterData = {};
          
          // 생산계획 데이터 조회
          const planResponse = await executeQuery(PRODUCTION_PLANS_QUERY, { filter: filterData });
          if (planResponse.data && isMounted) {
            const formattedData = formatPlanGridData(planResponse.data);
            setPlanList(formattedData);
            setRefreshKey(prev => prev + 1);
          }
          
          // 제품 마스터 데이터 조회
          const materialsResponse = await executeQuery(MATERIALS_QUERY);
          if (materialsResponse.data && isMounted) {
            const materials = [];
            
            // 제품 정보 추출
            const allMaterials = materialsResponse.data.getAllMaterials || [];
            allMaterials.forEach(materialTypeGroup => {
              const materialType = materialTypeGroup.materialType;
              const categories = materialTypeGroup.categories || [];
              
              categories.forEach(category => {
                const materialCategory = category.materialCategory;
                const categoryMaterials = category.materials || [];
                
                categoryMaterials.forEach(material => {
                  materials.push({
                    ...material,
                    materialType,
                    materialCategory
                  });
                });
              });
            });
            
            setProductMaterials(materials);
          }
          
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Initial data load error:", err);
        if (isMounted) {
          setIsLoading(false);
          setPlanList([]);
          setWorkOrderList([]);
        }
      }
    };

    fetchData();

    // 클린업 함수
    return () => {
      isMounted = false;
    };
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  // 도메인별 색상 설정 함수
  const getTextColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  }, [domain, isDarkMode]);

  const getBgColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  }, [domain, isDarkMode]);

  const getBorderColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  }, [domain, isDarkMode]);

  return {
    isLoading,
    planList,
    workOrderList,
    selectedPlan,
    selectedWorkOrder,
    refreshKey,
    handleSearch,
    handleReset,
    handlePlanSelect,
    handleWorkOrderSelect,
    handleAddWorkOrder,
    handleSaveWorkOrder,
    handleDeleteWorkOrder,
    handleStartWork,
    handleCompleteWork,
    handleProcessRowUpdate,
    getTextColor,
    getBgColor,
    getBorderColor,
    productMaterials,
    handleDateRangeChange
  };
};
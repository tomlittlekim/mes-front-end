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
      workOrderId: '',
      state: '',
      dateRange: {
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

  const DELETE_WORK_ORDER_MUTATION = gql`
      mutation DeleteWorkOrder($workOrderId: String!) {
          deleteWorkOrder(workOrderId: $workOrderId)
      }
  `;

  const START_WORK_ORDER_MUTATION = gql`
      mutation StartWorkOrder($workOrderId: String!) {
          startWorkOrder(workOrderId: $workOrderId)
      }
  `;

  const COMPLETE_WORK_ORDER_MUTATION = gql`
      mutation CompleteWorkOrder($workOrderId: String!) {
          completeWorkOrder(workOrderId: $workOrderId)
      }
  `;

  // 새 작업지시 행 생성 함수
  const createNewWorkOrder = useCallback(() => {
    const currentDate = new Date();
    const currentUser = loginUser.loginId;
    const newId = generateId();

    return {
      id: newId,
      workOrderId: '자동입력',
      prodPlanId: selectedPlan ? selectedPlan.prodPlanId : '',
      productId: selectedPlan ? selectedPlan.productId : '',
      orderQty: selectedPlan ? selectedPlan.planQty : 0,
      shiftType: selectedPlan ? selectedPlan.shiftType || 'DAY' : 'DAY',
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

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      prodPlanId: '',
      productId: '',
      workOrderId: '',
      state: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

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

    // dateRange 객체에서 시작일 범위를 추출하여 필터 데이터로 변환
    if (filterData.dateRange) {
      if (filterData.dateRange.startDate) {
        try {
          filterData.planStartDateFrom = format(filterData.dateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.planStartDateFrom = null;
        }
      }

      if (filterData.dateRange.endDate) {
        try {
          filterData.planStartDateTo = format(filterData.dateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.planStartDateTo = null;
        }
      }

      // dateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.dateRange;
    }

    // state 필드 처리 - 값이 있으면 배열로 변환
    if (filterData.state) {
      filterData.state = [filterData.state]; // 단일 값을 배열로 변환
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
  }, [executeQuery, PRODUCTION_PLANS_QUERY, formatPlanGridData, setUpdatedRows, setAddRows, reset]);

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
  }, [setAddRows, setUpdatedRows]);

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

    console.log("저장할 데이터:", {
      createdRows: createdWorkOrderInputs,
      updatedRows: updatedWorkOrderInputs
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

  // 삭제 버튼 클릭 핸들러
  const handleDeleteWorkOrder = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning(Message.DELETE_SELECT_REQUIRED);
      return;
    }

    // 신규 추가된 행이면 바로 목록에서만 삭제
    if (selectedWorkOrder.id.startsWith('NEW_')) {
      const updatedList = workOrderList.filter(w => w.id !== selectedWorkOrder.id);
      setWorkOrderList(updatedList);
      // 추가된 행 목록에서도 제거
      setAddRows(prev => prev.filter(w => w.id !== selectedWorkOrder.id));
      setSelectedWorkOrder(null);
      return;
    }

    // Message 클래스의 삭제 확인 다이얼로그 사용
    Message.showDeleteConfirm(() => {
      executeMutation(DELETE_WORK_ORDER_MUTATION, { workOrderId: selectedWorkOrder.workOrderId })
      .then(() => {
        // 소프트 삭제 이후 목록에서 제거 (UI 상에서 표시되지 않도록)
        const updatedList = workOrderList.filter(w => w.id !== selectedWorkOrder.id);
        setWorkOrderList(updatedList);
        setSelectedWorkOrder(null);
        Message.showSuccess(Message.DELETE_SUCCESS);
      })
      .catch((error) => {
        console.error("Error deleting work order:", error);
        Message.showError({ message: '삭제 중 오류가 발생했습니다.' });
      });
    });
  }, [selectedWorkOrder, workOrderList, setAddRows, executeMutation, DELETE_WORK_ORDER_MUTATION]);

  // 작업 시작 핸들러
  const handleStartWork = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning('시작할 작업지시를 선택해주세요.');
      return;
    }

    if (selectedWorkOrder.state === 'IN_PROGRESS' || selectedWorkOrder.state === 'COMPLETED') {
      Message.showWarning('이미 진행 중이거나 완료된 작업입니다.');
      return;
    }

    // 사용자 확인 다이얼로그 표시
    Message.showConfirm(
        '작업 시작',
        `작업지시 [${selectedWorkOrder.workOrderId}]를 시작하시겠습니까?`,
        () => {
          // 백엔드 API 호출하여 상태 변경
          executeMutation(START_WORK_ORDER_MUTATION, { workOrderId: selectedWorkOrder.workOrderId })
          .then((result) => {
            if (result?.data?.startWorkOrder) {
              // 상태 변경
              const updatedOrder = { ...selectedWorkOrder, state: 'IN_PROGRESS' };

              setWorkOrderList(prev =>
                  prev.map(order => order.id === selectedWorkOrder.id ? updatedOrder : order)
              );

              setSelectedWorkOrder(updatedOrder);
              Message.showSuccess('작업이 시작되었습니다.');
            } else {
              Message.showError({ message: '작업 시작 처리에 실패했습니다.' });
            }
          })
          .catch((error) => {
            console.error("Error starting work order:", error);
            Message.showError({ message: '작업 시작 중 오류가 발생했습니다.' });
          });
        }
    );
  }, [selectedWorkOrder, executeMutation, START_WORK_ORDER_MUTATION]);

  // 작업 완료 핸들러
  const handleCompleteWork = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning('완료할 작업지시를 선택해주세요.');
      return;
    }

    if (selectedWorkOrder.state === 'COMPLETED') {
      Message.showWarning('이미 완료된 작업입니다.');
      return;
    }

    // 사용자 확인 다이얼로그 표시
    Message.showConfirm(
        '작업 완료',
        `작업지시 [${selectedWorkOrder.workOrderId}]를 완료 처리하시겠습니까?`,
        () => {
          // 백엔드 API 호출하여 상태 변경
          executeMutation(COMPLETE_WORK_ORDER_MUTATION, { workOrderId: selectedWorkOrder.workOrderId })
          .then((result) => {
            if (result?.data?.completeWorkOrder) {
              // 상태 변경
              const updatedOrder = { ...selectedWorkOrder, state: 'COMPLETED' };

              setWorkOrderList(prev =>
                  prev.map(order => order.id === selectedWorkOrder.id ? updatedOrder : order)
              );

              setSelectedWorkOrder(updatedOrder);
              Message.showSuccess('작업이 완료되었습니다.');
            } else {
              Message.showError({ message: '작업 완료 처리에 실패했습니다.' });
            }
          })
          .catch((error) => {
            console.error("Error completing work order:", error);
            Message.showError({ message: '작업 완료 중 오류가 발생했습니다.' });
          });
        }
    );
  }, [selectedWorkOrder, executeMutation, COMPLETE_WORK_ORDER_MUTATION]);

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

          executeQuery(PRODUCTION_PLANS_QUERY, { filter: filterData })
          .then(response => {
            if (response.data && isMounted) {
              const formattedData = formatPlanGridData(response.data);
              setPlanList(formattedData);
              setRefreshKey(prev => prev + 1);
            }
            if (isMounted) {
              setIsLoading(false);
            }
          })
          .catch(error => {
            console.error("Error fetching production plans:", error);
            if (isMounted) {
              Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
              setIsLoading(false);
              setPlanList([]);
            }
          });
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
    getBorderColor
  };
};
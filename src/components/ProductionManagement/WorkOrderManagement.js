import React, {useState, useEffect, useCallback, useMemo} from 'react';
import './WorkOrderManagement.css';
import {useForm, Controller} from 'react-hook-form';
import useLocalStorageVO from '../Common/UseLocalStorageVO';
import {
  TextField,
  Grid,
  Box,
  Typography,
  useTheme,
  Stack,
  IconButton,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import {EnhancedDataGridWrapper, SearchCondition} from '../Common';
import {useDomain, DOMAINS} from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import DateRangePicker from '../Common/DateRangePicker';
import {format} from 'date-fns';
import Message from '../../utils/message/Message';
import ko from "date-fns/locale/ko";
import {useGridRow} from '../../utils/grid/useGridRow';
import {useGridUtils} from '../../utils/grid/useGridUtils';
import {useGridDataCall} from '../../utils/grid/useGridDataCall';
import {useGraphQL} from '../../apollo/useGraphQL';
import {gql} from '@apollo/client';

/**
 * 작업지시관리 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const WorkOrderManagement = (props) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const {domain} = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const {loginUser} = useLocalStorageVO();

  // React Hook Form 설정
  const {control, handleSubmit, reset, getValues, setValue} = useForm({
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 그리드 유틸리티 훅 사용
  const {formatDateToYYYYMMDD, generateId, getCurrentDate} = useGridUtils();

  // GraphQL 훅 사용
  const {executeQuery, executeMutation} = useGraphQL();

  // 상태 옵션 정의
  const stateOptions = [
    {value: 'PLANNED', label: '계획됨'},
    {value: 'IN_PROGRESS', label: '진행중'},
    {value: 'COMPLETED', label: '완료됨'},
    {value: 'CANCELED', label: '취소됨'}
  ];

  // 근무타입 옵션
  const shiftOptions = [
    {value: 'DAY', label: '주간'},
    {value: 'NIGHT', label: '야간'}
  ];

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

  // API 통신 시 Date 객체를 문자열로 변환하는 함수 개선
  const formatDateToString = useCallback((dateObj) => {
    if (!dateObj) {
      return null;
    }

    // 이미 적절한 형식의 문자열인 경우
    if (typeof dateObj === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(dateObj)) {
        return dateObj;
      }

      try {
        return format(new Date(dateObj), 'yyyy-MM-dd');
      } catch (error) {
        console.error("Invalid date string:", dateObj);
        return null;
      }
    }

    // Date 객체 처리
    try {
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", dateObj);
      return null;
    }
  }, []);

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

  const WORK_ORDERS_QUERY = gql`
      query getWorkOrders($filter: WorkOrderFilter) {
          workOrders(filter: $filter) {
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

  // 새 생산계획 행 생성 함수
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

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('dateRange', {startDate, endDate});
  }, [setValue]);

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
          filterData.planStartDateFrom = format(filterData.dateRange.startDate,
              'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.planStartDateFrom = null;
        }
      }

      if (filterData.dateRange.endDate) {
        try {
          filterData.planStartDateTo = format(filterData.dateRange.endDate,
              'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.planStartDateTo = null;
        }
      }

      // dateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.dateRange;
    }

    // 생산계획 검색
    executeQuery(PRODUCTION_PLANS_QUERY, {filter: filterData})
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
      Message.showError({message: '데이터를 불러오는데 실패했습니다.'});
      setIsLoading(false);
      setPlanList([]);
    });
  }, [executeQuery, PRODUCTION_PLANS_QUERY, formatPlanGridData, setUpdatedRows,
    setAddRows]);

  // 계획 선택 핸들러
  const handlePlanSelect = useCallback((params) => {
    const plan = planList.find(p => p.id === params.id);
    setSelectedPlan(plan);
    setSelectedWorkOrder(null);

    if (plan && plan.prodPlanId) {
      // 선택한 생산계획의 작업지시 조회
      executeQuery(WORK_ORDERS_BY_PLAN_QUERY, {prodPlanId: plan.prodPlanId})
      .then(response => {
        if (response.data) {
          const formattedData = formatWorkOrderGridData(response.data);
          setWorkOrderList(formattedData);
        }
      })
      .catch(error => {
        console.error("Error fetching work orders:", error);
        Message.showError({message: '작업지시 데이터를 불러오는데 실패했습니다.'});
        setWorkOrderList([]);
      });
    } else {
      setWorkOrderList([]);
    }
  }, [planList, executeQuery, WORK_ORDERS_BY_PLAN_QUERY,
    formatWorkOrderGridData]);

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = useCallback((params) => {
    const workOrder = workOrderList.find(w => w.id === params.id);
    setSelectedWorkOrder(workOrder);
  }, [workOrderList]);

  // 행 업데이트 처리 핸들러 개선
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const isNewRow = oldRow.id.startsWith('NEW_');

    // 깊은 복제로 원본 데이터 보존
    const processedRow = {...newRow};

    // orderQty 필드 명시적 처리
    if (processedRow.orderQty === undefined || processedRow.orderQty === null
        || processedRow.orderQty === '') {
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
      return prev.map(
          (row) => row.id === oldRow.id ? {...row, ...processedRow} : row);
    });

    if (isNewRow) {
      setAddRows((prevAddRows) => {
        const existingIndex = prevAddRows.findIndex(
            row => row.id === oldRow.id);
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
        const existingIndex = prevUpdatedRows.findIndex(
            row => row.workOrderId === oldRow.workOrderId);
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
          if (row[field] === undefined || row[field] === null || row[field]
              === '') {
            Message.showError({message: `${field} 필드는 필수 입력값입니다.`});
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
      const currentRow = workOrderList.find(
          row => row.workOrderId === updatedRow.workOrderId) || updatedRow;

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
          executeQuery(WORK_ORDERS_BY_PLAN_QUERY,
              {prodPlanId: selectedPlan.prodPlanId})
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
      Message.showError({message: errorMessage});
    });
  }, [workOrderList, updatedRows, selectedPlan, setAddRows, setUpdatedRows,
    executeMutation, SAVE_WORK_ORDER_MUTATION, WORK_ORDERS_BY_PLAN_QUERY,
    executeQuery, formatWorkOrderGridData]);

  // 삭제 버튼 클릭 핸들러 수정 - SoftDelete 적용
  const handleDeleteWorkOrder = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning(Message.DELETE_SELECT_REQUIRED);
      return;
    }

    // 신규 추가된 행이면 바로 목록에서만 삭제
    if (selectedWorkOrder.id.startsWith('NEW_')) {
      const updatedList = workOrderList.filter(
          w => w.id !== selectedWorkOrder.id);
      setWorkOrderList(updatedList);
      // 추가된 행 목록에서도 제거
      setAddRows(prev => prev.filter(w => w.id !== selectedWorkOrder.id));
      setSelectedWorkOrder(null);
      return;
    }

    // Message 클래스의 삭제 확인 다이얼로그 사용
    Message.showDeleteConfirm(() => {
      executeMutation({
        mutation: DELETE_WORK_ORDER_MUTATION,
        variables: {workOrderId: selectedWorkOrder.workOrderId}
      })
      .then(() => {
        // 소프트 삭제 이후 목록에서 제거 (UI 상에서 표시되지 않도록)
        const updatedList = workOrderList.filter(
            w => w.id !== selectedWorkOrder.id);
        setWorkOrderList(updatedList);
        setSelectedWorkOrder(null);
        Message.showSuccess(Message.DELETE_SUCCESS);
      })
      .catch((error) => {
        console.error("Error deleting work order:", error);
        Message.showError({message: '삭제 중 오류가 발생했습니다.'});
      });
    });
  }, [selectedWorkOrder, workOrderList, setAddRows, executeMutation,
    DELETE_WORK_ORDER_MUTATION]);

  // 작업 시작 핸들러
  const handleStartWork = useCallback(() => {
    if (!selectedWorkOrder) {
      Message.showWarning('시작할 작업지시를 선택해주세요.');
      return;
    }

    if (selectedWorkOrder.state === 'IN_PROGRESS' || selectedWorkOrder.state
        === 'COMPLETED') {
      Message.showWarning('이미 진행 중이거나 완료된 작업입니다.');
      return;
    }

    // 사용자 확인 다이얼로그 표시
    Message.showConfirm(
        '작업 시작',
        `작업지시 [${selectedWorkOrder.workOrderId}]를 시작하시겠습니까?`,
        () => {
          // 백엔드 API 호출하여 상태 변경
          executeMutation({
            mutation: START_WORK_ORDER_MUTATION,
            variables: {workOrderId: selectedWorkOrder.workOrderId}
          })
          .then((result) => {
            if (result?.data?.startWorkOrder) {
              // 상태 변경
              const updatedOrder = {...selectedWorkOrder, state: 'IN_PROGRESS'};

              setWorkOrderList(prev =>
                  prev.map(
                      order => order.id === selectedWorkOrder.id ? updatedOrder : order)
              );

              setSelectedWorkOrder(updatedOrder);
              Message.showSuccess('작업이 시작되었습니다.');
            } else {
              Message.showError({message: '작업 시작 처리에 실패했습니다.'});
            }
          })
          .catch((error) => {
            console.error("Error starting work order:", error);
            Message.showError({message: '작업 시작 중 오류가 발생했습니다.'});
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
          executeMutation({
            mutation: COMPLETE_WORK_ORDER_MUTATION,
            variables: {workOrderId: selectedWorkOrder.workOrderId}
          })
          .then((result) => {
            if (result?.data?.completeWorkOrder) {
              // 상태 변경
              const updatedOrder = {...selectedWorkOrder, state: 'COMPLETED'};

              setWorkOrderList(prev =>
                  prev.map(
                      order => order.id === selectedWorkOrder.id ? updatedOrder : order)
              );

              setSelectedWorkOrder(updatedOrder);
              Message.showSuccess('작업이 완료되었습니다.');
            } else {
              Message.showError({message: '작업 완료 처리에 실패했습니다.'});
            }
          })
          .catch((error) => {
            console.error("Error completing work order:", error);
            Message.showError({message: '작업 완료 중 오류가 발생했습니다.'});
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

          executeQuery(PRODUCTION_PLANS_QUERY, {filter: filterData})
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
              Message.showError({message: '데이터를 불러오는데 실패했습니다.'});
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

  // DatePicker 커스텀 에디터 컴포넌트
  const CustomDateEditor = useCallback((props) => {
    const {id, field, value, api} = props;

    const handleChange = (newValue) => {
      // DataGrid API를 사용하여 셀 값을 업데이트
      api.setEditCellValue({id, field, value: newValue});

      // 변경 후 자동으로 편집 모드 종료 (선택적)
      setTimeout(() => {
        api.commitCellChange({id, field});
        api.setCellMode(id, field, 'view');
      }, 200);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
              value={value ? new Date(value) : null}
              onChange={handleChange}
              format="yyyy-MM-dd"
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  size: 'small',
                  sx: {m: 0, p: 0},
                  // 키보드 상호작용 처리
                  onKeyDown: (e) => {
                    if (e.key === 'Escape') {
                      api.setCellMode(id, field, 'view');
                    }
                  }
                },
                // 포퍼(팝업) 스타일 조정
                popper: {
                  sx: {
                    zIndex: 9999 // 다른 요소 위에 표시되도록
                  }
                }
              }}
          />
        </LocalizationProvider>
    );
  }, []);

  // 생산계획 목록 그리드 컬럼 정의
  const planColumns = useMemo(() => ([
    {
      field: 'prodPlanId',
      headerName: '생산계획ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'orderId',
      headerName: '주문번호',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'planQty',
      headerName: '계획수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'planStartDate',
      headerName: '계획시작일시',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          } catch (e) {
            displayValue = '';
          }
        }

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'planEndDate',
      headerName: '계획종료일시',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          } catch (e) {
            displayValue = '';
          }
        }

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    }
  ]), []);

  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = useMemo(() => ([
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'prodPlanId',
      headerName: '생산계획ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID*',
      width: 150,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');

        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');

        return (
            <Typography variant="body2"
                        sx={{color: showRequired ? '#f44336' : 'inherit'}}>
              {showRequired ? '필수 입력' : params.value || ''}
            </Typography>
        );
      }
    },
    {
      field: 'orderQty',
      headerName: '작업수량',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'shiftType',
      headerName: '근무타입',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderEditCell: (params) => (
          <FormControl fullWidth>
            <Select
                value={params.value || 'DAY'}
                onChange={(e) => params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: e.target.value
                })}
                size="small"
            >
              {shiftOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
      ),
      valueFormatter: (params) => {
        const option = shiftOptions.find(opt => opt.value === params.value);
        return option ? option.label : params.value;
      }
    },
    {
      field: 'state',
      headerName: '상태',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderEditCell: (params) => (
          <FormControl fullWidth>
            <Select
                value={params.value || 'PLANNED'}
                onChange={(e) => params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: e.target.value
                })}
                size="small"
            >
              {stateOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
      ),
      renderCell: (params) => {
        const option = stateOptions.find(opt => opt.value === params.value);
        const label = option ? option.label : params.value;
        let className = '';

        // CSS 클래스 결정
        switch (params.value) {
          case 'PLANNED':
            className = 'status-planned';
            break;
          case 'IN_PROGRESS':
            className = 'status-inprogress';
            break;
          case 'COMPLETED':
            className = 'status-completed';
            break;
          case 'CANCELED':
            className = 'status-canceled';
            break;
          default:
            break;
        }

        return (
            <Typography variant="body2" className={className}>
              {label}
            </Typography>
        );
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    },
    {
      field: 'updateUser',
      headerName: '수정자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'updateDate',
      headerName: '수정일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    }
  ]), [shiftOptions, stateOptions]);

  // 생산계획 목록 그리드 버튼
  const planGridButtons = useMemo(() => ([]), []);

  // 작업지시 목록 그리드 버튼
  const workOrderGridButtons = useMemo(() => ([
    {label: '등록', onClick: handleAddWorkOrder, icon: <AddIcon/>},
    {label: '저장', onClick: handleSaveWorkOrder, icon: <SaveIcon/>},
    {label: '삭제', onClick: handleDeleteWorkOrder, icon: <DeleteIcon/>},
    {label: '작업시작', onClick: handleStartWork, icon: <PlayCircleOutlineIcon/>},
    {
      label: '작업완료',
      onClick: handleCompleteWork,
      icon: <CheckCircleOutlineIcon/>
    }
  ]), [handleAddWorkOrder, handleSaveWorkOrder, handleDeleteWorkOrder,
    handleStartWork, handleCompleteWork]);

  // 그리드 속성
  const gridProps = useMemo(() => ({
    editMode: 'cell',
    processRowUpdate: handleProcessRowUpdate,
    onProcessRowUpdateError: (error) => {
      console.error('데이터 업데이트 오류:', error);
    }
  }), [handleProcessRowUpdate]);

  // 초기 정렬 상태 설정 추가
  // planList 그리드 - 생산계획ID 역순
  const planInitialState = useMemo(() => ({
    sorting: {
      sortModel: [{field: 'prodPlanId', sort: 'desc'}]
    }
  }), []);

  // workOrderList 그리드 - 작업지시ID 역순
  const workOrderInitialState = useMemo(() => ({
    sorting: {
      sortModel: [{field: 'workOrderId', sort: 'desc'}]
    }
  }), []);

  return (
      <Box sx={{p: 0, minHeight: '100vh'}} className="work-order-container">
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          borderBottom: `1px solid ${getBorderColor()}`,
          pb: 1
        }}>
          <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: getTextColor()
              }}
          >
            작업지시관리
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              sx={{
                ml: 1,
                color: isDarkMode ? theme.palette.primary.light
                    : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.light, 0.1)
                      : alpha(theme.palette.primary.main, 0.05)
                }
              }}
          >
            <HelpOutlineIcon/>
          </IconButton>
        </Box>

        {/* 검색 조건 영역 */}
        <SearchCondition
            onSearch={handleSubmit(handleSearch)}
            onReset={handleReset}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="prodPlanId"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="생산계획ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="생산계획ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="productId"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="제품ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="제품ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="workOrderId"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="작업지시ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="작업지시ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="state"
                control={control}
                render={({field}) => (
                    <FormControl fullWidth size="small">
                      <InputLabel id="state-select-label">상태</InputLabel>
                      <Select
                          {...field}
                          labelId="state-select-label"
                          label="상태"
                      >
                        <MenuItem value="">전체</MenuItem>
                        {stateOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}
                                  adapterLocale={ko}>
              <Controller
                  name="dateRange"
                  control={control}
                  render={({field}) => (
                      <DateRangePicker
                          startDate={field.value.startDate}
                          endDate={field.value.endDate}
                          onRangeChange={handleDateRangeChange}
                          startLabel="시작일"
                          endLabel="종료일"
                          label="계획시작일"
                          size="small"
                      />
                  )}
              />
            </LocalizationProvider>
          </Grid>
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              {/* 생산계획 그리드 - 왼쪽 */}
              <Grid item xs={12} md={6}>
                <EnhancedDataGridWrapper
                    title="생산계획목록"
                    key={refreshKey}
                    rows={planList}
                    columns={planColumns}
                    buttons={planGridButtons}
                    height={450}
                    onRowClick={handlePlanSelect}
                    tabId={props.tabId + "-production-plans"}
                    gridProps={{
                      initialState: planInitialState
                    }}
                />
              </Grid>

              {/* 작업지시 그리드 - 오른쪽 */}
              <Grid item xs={12} md={6}>
                <EnhancedDataGridWrapper
                    title={`작업지시목록 ${selectedPlan ? '- '
                        + selectedPlan.prodPlanId : ''}`}
                    key={refreshKey + "-workorders"}
                    rows={workOrderList}
                    columns={workOrderColumns}
                    buttons={workOrderGridButtons}
                    height={450}
                    onRowClick={handleWorkOrderSelect}
                    tabId={props.tabId + "-work-orders"}
                    gridProps={{
                      ...gridProps,
                      initialState: workOrderInitialState
                    }}
                />
              </Grid>
            </Grid>
        )}

        {/* 하단 정보 영역 */}
        <Box mt={2} p={2} sx={{
          bgcolor: getBgColor(),
          borderRadius: 1,
          border: `1px solid ${getBorderColor()}`
        }}>
          <Stack spacing={1}>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시관리 화면에서는 생산계획에 따른 작업지시를 효율적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 좌측 생산계획 목록에서 계획을 선택하면 우측에 해당 계획에 대한 작업지시 목록이 표시됩니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 작업지시는 개별 등록이 가능합니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="작업지시관리 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시관리에서는 생산계획에 따른 작업지시를 등록하고 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 왼쪽 생산계획 목록에서 계획을 선택하면 오른쪽에 해당 계획과 연계된 작업지시 목록이 표시됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시 정보는 생산 실적 관리, 품질 관리 등에서 활용됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시는 수동으로 등록할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시의 상태(계획, 작업중, 완료 등)를 관리하여 생산 진행 상황을 실시간으로 파악할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default WorkOrderManagement;
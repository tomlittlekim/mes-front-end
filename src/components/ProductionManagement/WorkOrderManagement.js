import React, { useState, useEffect } from 'react';
import './WorkOrderManagement.css';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Box,
  Typography,
  useTheme,
  Stack,
  IconButton,
  alpha,
  Button
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { EnhancedDataGridWrapper, SearchCondition } from '../Common';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import { GRAPHQL_URL } from '../../config';
import { format } from 'date-fns';
import Message from '../../utils/message/Message';
import ko from "date-fns/locale/ko";

const WorkOrderManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // React Hook Form 설정
  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: {
      prodPlanId: '',
      productId: '',
      planStartDate: null,
      planEndDate: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [planList, setPlanList] = useState([]);
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [updatedWorkOrders, setUpdatedWorkOrders] = useState([]);
  const [addWorkOrders, setAddWorkOrders] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const CustomDateEditor = (props) => {
    const { id, field, value, api } = props;

    const handleChange = (newValue) => {
      api.setEditCellValue({ id, field, value: newValue });
      setTimeout(() => {
        api.commitCellChange({ id, field });
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
                  sx: { m: 0, p: 0 },
                  onKeyDown: (e) => {
                    if (e.key === 'Escape') {
                      api.setCellMode(id, field, 'view');
                    }
                  }
                },
                popper: {
                  sx: {
                    zIndex: 9999
                  }
                }
              }}
          />
        </LocalizationProvider>
    );
  };

  // API 통신 시 Date 객체를 문자열로 변환하는 함수
  function formatDateToString(dateObj) {
    if (!dateObj) return null;

    if (typeof dateObj === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(dateObj)) return dateObj;

      try {
        return format(new Date(dateObj), 'yyyy-MM-dd');
      } catch (error) {
        console.error("Invalid date string:", dateObj);
        return null;
      }
    }

    try {
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", dateObj);
      return null;
    }
  }

  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };

  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  };

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  // GraphQL fetch 함수
  function fetchGraphQL(url, query, variables) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
  }

  // 초기화 함수
  const handleReset = () => {
    reset({
      prodPlanId: '',
      productId: '',
      planStartDate: null,
      planEndDate: null
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    setIsLoading(true);
    setUpdatedWorkOrders([]);
    setAddWorkOrders([]);
    setSelectedPlan(null);
    setSelectedWorkOrder(null);
    setWorkOrderList([]);

    // GraphQL 쿼리 작성 - 생산계획과 작업지시를 한 번에 조회
    const query = `
      query getProductionPlansWithWorkOrders($filter: ProductionPlanFilter) {
        productionPlansWithWorkOrders(filter: $filter) {
          id
          site
          compCd
          prodPlanId
          orderId
          productId
          planQty
          planStartDate
          planEndDate
          flagActive
          createUser
          createDate
          updateUser
          updateDate
          workOrders {
            id
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
      }
    `;

    // 날짜 형식 변환 - null 값도 허용
    const filterData = {
      ...data,
      planStartDate: data.planStartDate ? formatDateToString(data.planStartDate) : null,
      planEndDate: data.planEndDate ? formatDateToString(data.planEndDate) : null
    };

    fetchGraphQL(GRAPHQL_URL, query, { filter: filterData })
    .then((response) => {
      if (response.errors) {
        console.error("GraphQL errors:", response.errors);
        Message.showError({ message: '데이터를 불러오는데 실패했습니다.' }, setIsLoading);
      } else {
        const plansWithWorkOrders = response.data.productionPlansWithWorkOrders;

        // 생산계획 목록 처리
        const rowsWithId = plansWithWorkOrders.map((plan) => ({
          ...plan,
          id: plan.prodPlanId,
          // 서버에서 받은 데이터 변환
          planQty: plan.planQty ? Number(plan.planQty) : 0,
          planStartDate: plan.planStartDate ? new Date(plan.planStartDate) : null,
          planEndDate: plan.planEndDate ? new Date(plan.planEndDate) : null,
          createDate: plan.createDate ? new Date(plan.createDate) : null,
          updateDate: plan.updateDate ? new Date(plan.updateDate) : null
        }));

        setPlanList(rowsWithId);

        setRefreshKey(prev => prev + 1);
        setIsLoading(false);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' }, setIsLoading);
    });
  };

  // 생산계획 선택 핸들러
  const handlePlanSelect = (params) => {
    setSelectedWorkOrder(null);
    const selectedPlanRow = planList.find(p => p.id === params.id);
    setSelectedPlan(selectedPlanRow);

    if (selectedPlanRow && selectedPlanRow.workOrders) {
      // 선택한 계획에 연결된 작업지시 표시
      const workOrders = selectedPlanRow.workOrders.map(order => ({
        ...order,
        id: order.workOrderId,
        orderQty: order.orderQty ? Number(order.orderQty) : 0,
        createDate: order.createDate ? new Date(order.createDate) : null,
        updateDate: order.updateDate ? new Date(order.updateDate) : null
      }));

      setWorkOrderList(workOrders);
    } else {
      setWorkOrderList([]);
    }
  };

  // 작업지시 선택 핸들러
  const handleWorkOrderSelect = (params) => {
    const workOrder = workOrderList.find(wo => wo.id === params.id);
    setSelectedWorkOrder(workOrder);
  };

  // 작업지시 행 업데이트 처리 핸들러
  function handleWorkOrderRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    // 깊은 복제로 원본 데이터 보존
    const processedRow = { ...newRow };

    // orderQty 필드 명시적 처리
    if (processedRow.orderQty === undefined || processedRow.orderQty === null || processedRow.orderQty === '') {
      processedRow.orderQty = 0;
    } else if (typeof processedRow.orderQty === 'string') {
      // 문자열인 경우 숫자로 변환
      processedRow.orderQty = Number(processedRow.orderQty.replace(/,/g, ''));
      if (isNaN(processedRow.orderQty)) processedRow.orderQty = 0;
    }

    // 그리드 상태 업데이트
    setWorkOrderList((prev) => {
      return prev.map((row) => row.id === oldRow.id ? { ...row, ...processedRow } : row);
    });

    if (isNewRow) {
      setAddWorkOrders((prevAddRows) => {
        const existingIndex = prevAddRows.findIndex(row => row.id === oldRow.id);
        if (existingIndex !== -1) {
          const updatedRows = [...prevAddRows];
          updatedRows[existingIndex] = { ...updatedRows[existingIndex], ...processedRow };
          return updatedRows;
        } else {
          return [...prevAddRows, processedRow];
        }
      });
    } else {
      setUpdatedWorkOrders((prevUpdatedRows) => {
        const existingIndex = prevUpdatedRows.findIndex(row => row.workOrderId === oldRow.workOrderId);
        if (existingIndex !== -1) {
          const updatedRows = [...prevUpdatedRows];
          updatedRows[existingIndex] = { ...updatedRows[existingIndex], ...processedRow };
          return updatedRows;
        } else {
          return [...prevUpdatedRows, processedRow];
        }
      });
    }

    return processedRow;
  }

  // 작업지시 등록 버튼 클릭 핸들러
  const handleAddWorkOrder = () => {
    if (!selectedPlan) {
      Message.showWarning('생산계획을 먼저 선택해주세요.');
      return;
    }

    const currentDate = new Date();
    const currentUser = sessionStorage.getItem('userName') || '시스템';
    const newId = `NEW_${Date.now()}`;

    const newWorkOrder = {
      id: newId,
      workOrderId: '자동입력',
      prodPlanId: selectedPlan.prodPlanId,
      productId: selectedPlan.productId,
      orderQty: selectedPlan.planQty || 0,
      shiftType: 'DAY',
      state: 'PLANNED',
      flagActive: true,
      createUser: currentUser,
      createDate: currentDate,
      updateUser: currentUser,
      updateDate: currentDate
    };

    // 그리드에 새 행 추가
    setWorkOrderList(prev => [...prev, newWorkOrder]);

    // addWorkOrders에도 추가
    setAddWorkOrders(prev => [...prev, newWorkOrder]);
  };

  // 작업지시 일괄 생성 버튼 클릭 핸들러
  const handleCreateFromPlan = () => {
    if (!selectedPlan) {
      Message.showWarning('생산계획을 먼저 선택해주세요.');
      return;
    }

    // 이미 작업지시가 있는지 확인
    if (workOrderList.length > 0) {
      Message.showWarning('이미 작업지시가 존재합니다. 기존 작업지시를 확인해주세요.');
      return;
    }

    // GraphQL 뮤테이션
    const createFromPlanMutation = `
      mutation CreateWorkOrderFromPlan($prodPlanId: String!, $shiftType: String, $initialState: String) {
        createWorkOrderFromProductionPlan(
          prodPlanId: $prodPlanId, 
          shiftType: $shiftType, 
          initialState: $initialState
        )
      }
    `;

    fetchGraphQL(GRAPHQL_URL, createFromPlanMutation, {
      variables: {
        prodPlanId: selectedPlan.prodPlanId,
        shiftType: "DAY",
        initialState: "PLANNED"
      }
    })
    .then((response) => {
      if (response.errors) {
        console.error("GraphQL errors:", response.errors);
        Message.showError({ message: '작업지시 생성 중 오류가 발생했습니다.' });
      } else {
        // 성공 메시지와 함께 데이터 새로고침
        Message.showSuccess('작업지시가 생성되었습니다.', () => {
          // 현재 선택된 생산계획 ID 저장
          const currentPlanId = selectedPlan.prodPlanId;

          // 데이터 새로 조회 후 동일한 생산계획 선택 상태 유지
          handleSearch(getValues()).then(() => {
            // 생산계획 목록이 로드된 후 동일한 계획 찾아서 선택
            const plan = planList.find(p => p.prodPlanId === currentPlanId);
            if (plan) {
              setSelectedPlan(plan);

              // 선택한 계획의 작업지시 목록 업데이트
              if (plan.workOrders) {
                const workOrders = plan.workOrders.map(order => ({
                  ...order,
                  id: order.workOrderId,
                  orderQty: order.orderQty ? Number(order.orderQty) : 0,
                  createDate: order.createDate ? new Date(order.createDate) : null,
                  updateDate: order.updateDate ? new Date(order.updateDate) : null
                }));

                setWorkOrderList(workOrders);
              }
            }
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error creating work order:", error);
      Message.showError({ message: '작업지시 생성 중 예외가 발생했습니다.' });
    });
  };

  // 작업지시 저장 버튼 클릭 핸들러
  const handleSaveWorkOrder = () => {
    // 중요: 항상 현재 그리드 상태에서 데이터를 가져옴
    const newRows = workOrderList.filter(row => row.id.startsWith('NEW_'));

    if (newRows.length === 0 && updatedWorkOrders.length === 0) {
      Message.showWarning('저장할 데이터가 없습니다.');
      return;
    }

    // GraphQL 뮤테이션 작성
    const saveWorkOrderMutation = `
      mutation SaveWorkOrder($createdRows: [WorkOrderInput], $updatedRows: [WorkOrderUpdate]) {
        saveWorkOrder(createdRows: $createdRows, updatedRows: $updatedRows)
      }
    `;

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
    const requiredFields = ['prodPlanId', 'productId'];
    if (!validateRequiredFields(newRows, requiredFields) ||
        !validateRequiredFields(updatedWorkOrders, requiredFields)) {
      return;
    }

    // 생성할 행 변환 - GraphQL 스키마에 맞게 필드 조정
    const createdWorkOrderInputs = newRows.map(row => ({
      prodPlanId: row.prodPlanId || '',
      productId: row.productId || '',
      orderQty: parseFloat(row.orderQty) || 0,
      shiftType: row.shiftType || 'DAY',
      state: row.state || 'PLANNED',
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    }));

    // 업데이트할 행 변환 - GraphQL 스키마에 맞게 필드 조정
    const updatedWorkOrderInputs = updatedWorkOrders.map(updatedRow => {
      // 그리드에서 최신 데이터 찾기
      const currentRow = workOrderList.find(row => row.workOrderId === updatedRow.workOrderId) || updatedRow;

      return {
        workOrderId: currentRow.workOrderId,
        prodPlanId: currentRow.prodPlanId || '',
        productId: currentRow.productId || '',
        orderQty: parseFloat(currentRow.orderQty) || 0,
        shiftType: currentRow.shiftType || 'DAY',
        state: currentRow.state || 'PLANNED',
        flagActive: currentRow.flagActive === undefined ? true : Boolean(currentRow.flagActive)
      };
    });

    console.log("저장할 데이터:", {
      createdRows: createdWorkOrderInputs,
      updatedRows: updatedWorkOrderInputs
    });

    // API 호출
    fetchGraphQL(GRAPHQL_URL, saveWorkOrderMutation, {
      createdRows: createdWorkOrderInputs,
      updatedRows: updatedWorkOrderInputs
    })
    .then((data) => {
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        let errorMessage = '저장 중 오류가 발생했습니다.';
        if (data.errors[0] && data.errors[0].message) {
          errorMessage = data.errors[0].message;
        }
        Message.showError({ message: errorMessage });
      } else {
        // 저장 성공 후 상태 초기화
        setAddWorkOrders([]);
        setUpdatedWorkOrders([]);
        // 저장 성공 메시지와 함께 데이터 새로고침
        Message.showSuccess('저장이 완료되었습니다.', () => {
          handleSearch(getValues());
        });
      }
    })
    .catch((error) => {
      console.error("Error saving work order:", error);
      Message.showError({ message: '저장 중 예외가 발생했습니다: ' + error.message });
    });
  };

  // 작업지시 삭제 버튼 클릭 핸들러
  const handleDeleteWorkOrder = () => {
    if (!selectedWorkOrder) {
      Message.showWarning('삭제할 작업지시를 선택해주세요.');
      return;
    }

    // 신규 추가된 행이면 바로 목록에서만 삭제
    if (selectedWorkOrder.id.startsWith('NEW_')) {
      const updatedList = workOrderList.filter(wo => wo.id !== selectedWorkOrder.id);
      setWorkOrderList(updatedList);
      setSelectedWorkOrder(null);
      return;
    }

    const deleteWorkOrderMutation = `
      mutation DeleteWorkOrder($workOrderId: String!) {
        deleteWorkOrder(workOrderId: $workOrderId)
      }
    `;

    // Message 클래스의 삭제 확인 다이얼로그 사용
    Message.showDeleteConfirm(() => {
      fetchGraphQL(GRAPHQL_URL, deleteWorkOrderMutation, {
        workOrderId: selectedWorkOrder.workOrderId
      })
      .then((data) => {
        if (data.errors) {
          console.error("GraphQL errors:", data.errors);
          Message.showError({ message: '삭제 중 오류가 발생했습니다.' });
        } else {
          const updatedList = workOrderList.filter(wo => wo.id !== selectedWorkOrder.id);
          setWorkOrderList(updatedList);
          setSelectedWorkOrder(null);
          Message.showSuccess('삭제가 완료되었습니다.');
        }
      })
      .catch((error) => {
        console.error("Error deleting work order:", error);
        Message.showError({ message: '삭제 중 예외가 발생했습니다.' });
      });
    });
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch({});
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 생산계획 목록 그리드 컬럼 정의
  const planColumns = [
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
      headerName: '계획시작일',
      width: 150,
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
      headerName: '계획종료일',
      width: 150,
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
      field: 'flagActive',
      headerName: '사용여부',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value ? '사용' : '미사용'
    }
  ];

  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = [
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      editable: true,
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
      headerName: '제품ID',
      width: 150,
      editable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'orderQty',
      headerName: '지시수량',
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
      headerName: '근무조',
      width: 100,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: ['DAY', 'NIGHT']
    },
    {
      field: 'state',
      headerName: '상태',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: ['PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
      valueFormatter: (params) => {
        const stateMap = {
          'PLANNED': '계획',
          'CONFIRMED': '확정',
          'IN_PROGRESS': '작업중',
          'COMPLETED': '완료',
          'CANCELED': '취소'
        };
        return stateMap[params.value] || params.value;
      }
    },
    {
      field: 'flagActive',
      headerName: '사용여부',
      width: 100,
      type: 'boolean',
      editable: true,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value ? '사용' : '미사용'
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2"></Typography>;

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    }
  ];

  // 생산계획 목록 그리드 버튼
  const planGridButtons = [];

  // 작업지시 목록 그리드 버튼
  const workOrderGridButtons = [
    { label: '등록', onClick: handleAddWorkOrder, icon: <AddIcon /> },
    { label: '계획기반생성', onClick: handleCreateFromPlan, icon: <PlaylistAddIcon /> },
    { label: '저장', onClick: handleSaveWorkOrder, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDeleteWorkOrder, icon: <DeleteIcon /> }
  ];

  // 행의 셀 편집 모드 커스텀 속성
  const gridProps = {
    editMode: 'cell',
    processRowUpdate: handleWorkOrderRowUpdate,
    onProcessRowUpdateError: (error) => {
      console.error('데이터 업데이트 오류:', error);
    },
    slots: {
      // 날짜 필드에 커스텀 에디터 적용
      editCell: (params) => {
        if (params.field === 'planStartDate' || params.field === 'planEndDate') {
          return <CustomDateEditor {...params} />;
        }
        return null; // 다른 필드는 기본 에디터 사용
      }
    }
  };

  return (
      <Box sx={{ p: 0, minHeight: '100vh' }}>
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
                color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.light, 0.1)
                      : alpha(theme.palette.primary.main, 0.05)
                }
              }}
          >
            <HelpOutlineIcon />
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
                render={({ field }) => (
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
                render={({ field }) => (
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
          <Grid item xs={12} sm={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Controller
                    name="planStartDate"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            label="계획시작일"
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true
                              }
                            }}
                        />
                    )}
                />
                <Typography variant="body2" sx={{ mx: 1 }}>~</Typography>
                <Controller
                    name="planEndDate"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            label="계획종료일"
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true
                              }
                            }}
                        />
                    )}
                />
              </Stack>
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
                    selectedItem={selectedPlan}
                />
              </Grid>

              {/* 작업지시 그리드 - 오른쪽 */}
              <Grid item xs={12} md={6}>
                <EnhancedDataGridWrapper
                    title={`작업지시목록 ${selectedPlan ? '- ' + selectedPlan.prodPlanId : ''}`}
                    key={refreshKey + "-workorders"}
                    rows={workOrderList}
                    columns={workOrderColumns}
                    buttons={workOrderGridButtons}
                    height={450}
                    onRowClick={handleWorkOrderSelect}
                    tabId={props.tabId + "-work-orders"}
                    gridProps={{
                      editMode: 'cell',
                      processRowUpdate: handleWorkOrderRowUpdate,
                      onProcessRowUpdateError: (error) => {
                        console.error('데이터 업데이트 오류:', error);
                      }
                    }}
                    selectedItem={selectedWorkOrder}
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
              • 작업지시는 개별 등록 또는 생산계획 기반 일괄 생성이 가능합니다.
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
            • 작업지시는 수동으로 등록하거나 생산계획을 기반으로 일괄 생성할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 작업지시의 상태(계획, 확정, 작업중, 완료 등)를 관리하여 생산 진행 상황을 실시간으로 파악할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default WorkOrderManagement;
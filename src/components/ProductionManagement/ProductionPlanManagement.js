import React, {useState, useEffect, useCallback, useMemo} from 'react';
import './ProductionPlanManagement.css';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
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
import {useGraphQL} from "../../apollo/useGraphQL";
import {gql} from '@apollo/client';

/**
 * 생산계획관리 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const ProductionPlanManagement = (props) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const {domain} = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const {loginUser} = useLocalStorageVO();

  // React Hook Form 설정
  const {control, handleSubmit, reset, getValues, setValue} = useForm({
    defaultValues: {
      prodPlanId: '',
      orderId: '',
      productId: '',
      shiftType: '', // 주/야간 유형 필드 추가
      planDateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 그리드 유틸리티 훅 사용
  const {formatDateToYYYYMMDD, generateId} = useGridUtils();

  // GraphQL 훅 사용
  const {executeQuery, executeMutation} = useGraphQL();

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

  // 새 행 생성 함수
  const createNewRow = useCallback(() => {
    const currentDate = new Date();
    const currentUser = loginUser.loginId;
    const newId = generateId();

    return {
      id: newId,
      prodPlanId: '자동입력',
      orderId: '',
      productId: '',
      shiftType: 'DAY', // 기본값으로 주간(DAY) 설정
      planQty: 0,
      planStartDate: currentDate,
      planEndDate: currentDate,
      flagActive: true,
      createUser: currentUser,
      createDate: currentDate,
      updateUser: currentUser,
      updateDate: currentDate
    };
  }, [loginUser, generateId]);

  // 그리드 행 관련 커스텀 훅 사용
  const {
    addRows,
    updatedRows,
    setAddRows,
    setUpdatedRows,
    handleRowAdd,
    resetRows
  } = useGridRow({
    createNewRow,
    formatNewRow: (row) => ({
      orderId: row.orderId || '',
      productId: row.productId || '',
      shiftType: row.shiftType || 'DAY',
      planQty: parseFloat(row.planQty) || 0,
      planStartDate: formatDateToString(row.planStartDate),
      planEndDate: formatDateToString(row.planEndDate),
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    }),
    formatUpdatedRow: (row) => ({
      prodPlanId: row.prodPlanId,
      orderId: row.orderId || '',
      productId: row.productId || '',
      shiftType: row.shiftType || 'DAY',
      planQty: parseFloat(row.planQty) || 0,
      planStartDate: formatDateToString(row.planStartDate),
      planEndDate: formatDateToString(row.planEndDate),
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    })
  });

  // 그리드 데이터 포맷 함수
  const formatGridData = useCallback((data) => {
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

  // GraphQL 쿼리 정의
  const PRODUCTION_PLANS_QUERY = gql`
      query getProductionPlans($filter: ProductionPlanFilter) {
          productionPlans(filter: $filter) {
              site
              compCd
              prodPlanId
              orderId
              productId
              shiftType
              planQty
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

  const SAVE_PRODUCTION_PLAN_MUTATION = `
    mutation SaveProductionPlan($createdRows: [ProductionPlanInput], $updatedRows: [ProductionPlanUpdate]) {
      saveProductionPlan(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

  const DELETE_PRODUCTION_PLAN_MUTATION = `
    mutation DeleteProductionPlan($prodPlanId: String!) {
      deleteProductionPlan(prodPlanId: $prodPlanId)
    }
  `;

  // 그리드 데이터 호출 훅 사용
  const {handleGridSearch} = useGridDataCall({
    executeQuery,
    executeMutation,
    query: PRODUCTION_PLANS_QUERY,
    formatData: formatGridData,
  });

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      prodPlanId: '',
      orderId: '',
      productId: '',
      shiftType: '',
      planDateRange: {
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

    // 날짜 형식 변환 - null 값도 허용
    const filterData = {...data};

    // planDateRange 객체에서 시작일 범위를 추출하여 필터 데이터로 변환
    if (filterData.planDateRange) {
      if (filterData.planDateRange.startDate) {
        try {
          filterData.planStartDateFrom = format(
              filterData.planDateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.planStartDateFrom = null;
        }
      }

      if (filterData.planDateRange.endDate) {
        try {
          filterData.planStartDateTo = format(filterData.planDateRange.endDate,
              'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.planStartDateTo = null;
        }
      }

      // planDateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.planDateRange;
    }

    executeQuery(
        {query: PRODUCTION_PLANS_QUERY, variables: {filter: filterData}})
    .then(response => {
      if (response.data) {
        const formattedData = formatGridData(response.data);
        setPlanList(formattedData);
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching production plans:", error);
      Message.showError({message: '데이터를 불러오는데 실패했습니다.'});
      setIsLoading(false);
      // 에러 발생 시 빈 배열 설정으로 UI 렌더링은 정상적으로 진행
      setPlanList([]);
    });
  }, [executeQuery, PRODUCTION_PLANS_QUERY, formatGridData, setUpdatedRows,
    setAddRows]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('planDateRange', {startDate, endDate});
  }, [setValue]);

  // 계획 선택 핸들러
  const handlePlanSelect = useCallback((params) => {
    const plan = planList.find(p => p.id === params.id);
    setSelectedPlan(plan);
  }, [planList]);

  // 행 업데이트 처리 핸들러 개선
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const isNewRow = oldRow.id.startsWith('NEW_');

    // 깊은 복제로 원본 데이터 보존
    const processedRow = {...newRow};

    // planQty 필드 명시적 처리
    if (processedRow.planQty === undefined || processedRow.planQty === null
        || processedRow.planQty === '') {
      processedRow.planQty = 0;
    } else if (typeof processedRow.planQty === 'string') {
      // 문자열인 경우 숫자로 변환
      processedRow.planQty = Number(processedRow.planQty.replace(/,/g, ''));
      if (isNaN(processedRow.planQty)) {
        processedRow.planQty = 0;
      }
    }

    // 그리드 상태 업데이트
    setPlanList((prev) => {
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
            row => row.prodPlanId === oldRow.prodPlanId);
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
  const handleAdd = useCallback(() => {
    const newRow = createNewRow();
    setPlanList(prev => [newRow, ...prev]);
    setAddRows(prev => [newRow, ...prev]);
  }, [createNewRow, setAddRows]);

  // 저장 버튼 클릭 핸들러 개선
  const handleSave = useCallback(() => {
    // 신규 추가 행 필터링
    const newRows = planList.filter(row => row.id.startsWith('NEW_'));

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
    const requiredFields = ['productId'];
    if (!validateRequiredFields(newRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }

    // 생성할 행 변환 - GraphQL 스키마에 맞게 필드 조정
    const createdPlanInputs = newRows.map(row => ({
      orderId: row.orderId || '',
      productId: row.productId || '',
      shiftType: row.shiftType || 'DAY',
      planQty: parseFloat(row.planQty) || 0,
      planStartDate: formatDateToString(row.planStartDate),
      planEndDate: formatDateToString(row.planEndDate),
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    }));

    // 업데이트할 행 변환 - GraphQL 스키마에 맞게 필드 조정
    const updatedPlanInputs = updatedRows.map(updatedRow => {
      // 그리드에서 최신 데이터 찾기
      const currentRow = planList.find(
          row => row.prodPlanId === updatedRow.prodPlanId) || updatedRow;

      return {
        prodPlanId: currentRow.prodPlanId,
        orderId: currentRow.orderId || '',
        productId: currentRow.productId || '',
        shiftType: currentRow.shiftType || 'DAY',
        planQty: parseFloat(currentRow.planQty) || 0,
        planStartDate: formatDateToString(currentRow.planStartDate),
        planEndDate: formatDateToString(currentRow.planEndDate),
        flagActive: currentRow.flagActive === undefined ? true : Boolean(
            currentRow.flagActive)
      };
    });

    console.log("저장할 데이터:", {
      createdRows: createdPlanInputs,
      updatedRows: updatedPlanInputs
    });

    // API 호출
    executeMutation({
      mutation: SAVE_PRODUCTION_PLAN_MUTATION,
      variables: {
        createdRows: createdPlanInputs,
        updatedRows: updatedPlanInputs,
      }
    })
    .then((data) => {
      // 저장 성공 후 상태 초기화
      setAddRows([]);
      setUpdatedRows([]);
      // 저장 성공 메시지와 함께 데이터 새로고침
      Message.showSuccess(Message.SAVE_SUCCESS, () => {
        handleSearch(getValues());
      });
    })
    .catch((error) => {
      console.error("Error saving production plan:", error);
      let errorMessage = '저장 중 오류가 발생했습니다.';
      if (error?.graphQLErrors?.[0]?.message) {
        errorMessage = error.graphQLErrors[0].message;
      }
      Message.showError({message: errorMessage});
    });
  }, [planList, updatedRows, setAddRows, setUpdatedRows, executeMutation,
    SAVE_PRODUCTION_PLAN_MUTATION, formatDateToString, handleSearch,
    getValues]);

  // 삭제 버튼 클릭 핸들러
// 삭제 버튼 클릭 핸들러 - SoftDelete로 변경
  const handleDelete = useCallback(() => {
    if (!selectedPlan) {
      Message.showWarning(Message.DELETE_SELECT_REQUIRED);
      return;
    }

    // 신규 추가된 행이면 바로 목록에서만 삭제
    if (selectedPlan.id.startsWith('NEW_')) {
      const updatedList = planList.filter(p => p.id !== selectedPlan.id);
      setPlanList(updatedList);
      // 추가된 행 목록에서도 제거
      setAddRows(prev => prev.filter(p => p.id !== selectedPlan.id));
      setSelectedPlan(null);
      return;
    }

    // Message 클래스의 삭제 확인 다이얼로그 사용
    Message.showDeleteConfirm(() => {
      executeMutation({
        mutation: DELETE_PRODUCTION_PLAN_MUTATION,
        variables: {prodPlanId: selectedPlan.prodPlanId}
      })
      .then(() => {
        // 소프트 삭제 이후 목록에서 제거
        const updatedList = planList.filter(p => p.id !== selectedPlan.id);
        setPlanList(updatedList);
        setSelectedPlan(null);
        Message.showSuccess(Message.DELETE_SUCCESS);
      })
      .catch((error) => {
        console.error("Error deleting production plan:", error);
        Message.showError({message: '삭제 중 오류가 발생했습니다.'});
      });
    });
  }, [selectedPlan, planList, setAddRows, executeMutation, DELETE_PRODUCTION_PLAN_MUTATION]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 컴포넌트 마운트 시에만 초기 데이터 로드
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        try {
          handleSearch({});
        } catch (err) {
          console.error("Initial load error:", err);
          setIsLoading(false);
        }
      }
    }, 100);

    // 클린업 함수
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // 의존성 배열 비우기

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

  // ShiftType 커스텀 에디터 컴포넌트 (주/야간 유형 선택)
  const ShiftTypeEditor = useCallback((props) => {
    const { id, field, value, api } = props;

    const handleChange = (event) => {
      const newValue = event.target.value;
      api.setEditCellValue({ id, field, value: newValue });

      // 변경 후 자동으로 편집 모드 종료
      setTimeout(() => {
        api.commitCellChange({ id, field });
        api.setCellMode(id, field, 'view');
      }, 200);
    };

    return (
        <Select
            value={value || 'DAY'}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ m: 0, p: 0 }}
        >
          <MenuItem value="DAY">주간</MenuItem>
          <MenuItem value="NIGHT">야간</MenuItem>
        </Select>
    );
  }, []);

  // 주/야간 칩 컴포넌트 - 더 시각적으로 구분되는 디자인
  const ShiftTypeChip = useCallback(({ type }) => {
    const isDay = type === 'DAY';

    // 주간(DAY) 스타일
    const dayChipStyle = {
      bgcolor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
      color: isDarkMode ? '#ffc107' : '#ff8f00',
      border: `1px solid ${isDarkMode ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 193, 7, 0.3)'}`,
      '& .MuiChip-icon': {
        color: isDarkMode ? '#ffc107' : '#ff8f00'
      }
    };

    // 야간(NIGHT) 스타일
    const nightChipStyle = {
      bgcolor: isDarkMode ? 'rgba(66, 165, 245, 0.2)' : 'rgba(66, 165, 245, 0.1)',
      color: isDarkMode ? '#42a5f5' : '#1976d2',
      border: `1px solid ${isDarkMode ? 'rgba(66, 165, 245, 0.5)' : 'rgba(66, 165, 245, 0.3)'}`,
      '& .MuiChip-icon': {
        color: isDarkMode ? '#42a5f5' : '#1976d2'
      }
    };

    return (
        <Chip
            icon={isDay ? <WbSunnyIcon fontSize="small" /> : <NightsStayIcon fontSize="small" />}
            label={isDay ? "주간" : "야간"}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              ...(isDay ? dayChipStyle : nightChipStyle),
              minWidth: '80px',
              justifyContent: 'center'
            }}
        />
    );
  }, [isDarkMode]);

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
      editable: true,
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
      field: 'shiftType',
      headerName: '주/야간',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: [
        { value: 'DAY', label: '주간' },
        { value: 'NIGHT', label: '야간' },
      ],
      renderCell: (params) => {
        return <ShiftTypeChip type={params.value || 'DAY'} />;
      }
    },
    {
      field: 'planQty',
      headerName: '계획수량',
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
      field: 'planStartDate',
      headerName: '계획시작일시',
      width: 180,
      editable: true,
      type: 'date',
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
      editable: true,
      type: 'date',
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
      width: 150,
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
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'updateDate',
      headerName: '수정일',
      width: 120,
      editable: false,
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
  ]), [ShiftTypeChip]);

  // 생산계획 목록 그리드 버튼
  const planGridButtons = useMemo(() => ([
    {label: '등록', onClick: handleAdd, icon: <AddIcon/>},
    {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
    {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
  ]), [handleAdd, handleSave, handleDelete]);

  // 초기 정렬 상태 설정 - 생산계획ID 기준 내림차순 정렬
  const initialState = useMemo(() => ({
    sorting: {
      sortModel: [{ field: 'prodPlanId', sort: 'desc' }]
    }
  }), []);

  // 그리드 속성
  const gridProps = useMemo(() => ({
    editMode: 'cell',
    processRowUpdate: handleProcessRowUpdate,
    onProcessRowUpdateError: (error) => {
      console.error('데이터 업데이트 오류:', error);
    },
    initialState: initialState, // 초기 정렬 상태 적용
    slots: {
      // 날짜 필드와 ShiftType 필드에 커스텀 에디터 적용
      editCell: (params) => {
        if (params.field === 'planStartDate' || params.field === 'planEndDate') {
          return <CustomDateEditor {...params} />;
        }
        if (params.field === 'shiftType') {
          return <ShiftTypeEditor {...params} />;
        }
        return null; // 다른 필드는 기본 에디터 사용
      }
    }
  }), [handleProcessRowUpdate, CustomDateEditor, ShiftTypeEditor, initialState]);

  return (
      <Box sx={{p: 0, minHeight: '100vh'}}>
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
            생산계획관리
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
                        label="계획ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="계획ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="orderId"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="주문번호"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="주문번호를 입력하세요"
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
                name="shiftType"
                control={control}
                render={({field}) => (
                    <FormControl fullWidth size="small">
                      <InputLabel id="shift-type-label">주/야간</InputLabel>
                      <Select
                          {...field}
                          labelId="shift-type-label"
                          label="주/야간"
                          placeholder="주/야간"
                      >
                        <MenuItem value="">전체</MenuItem>
                        <MenuItem value="DAY">주간</MenuItem>
                        <MenuItem value="NIGHT">야간</MenuItem>
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}
                                  adapterLocale={ko}>
              <Controller
                  name="planDateRange"
                  control={control}
                  render={({field}) => (
                      <DateRangePicker
                          startDate={field.value.startDate}
                          endDate={field.value.endDate}
                          onRangeChange={handleDateRangeChange}
                          startLabel="시작일"
                          endLabel="종료일"
                          label="계획시작일" // 기본값 "계획기간"에서 "계획시작일"로 변경
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
              <Grid item xs={12}>
                <EnhancedDataGridWrapper
                    title="생산계획목록"
                    key={refreshKey}
                    rows={planList}
                    columns={planColumns}
                    buttons={planGridButtons}
                    height={450}
                    onRowClick={handlePlanSelect}
                    tabId={props.tabId + "-production-plans"}
                    gridProps={gridProps}
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
              • 생산계획관리 화면에서는 제품별 생산계획을 효율적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 계획번호, 제품 정보, 주/야간 유형, 계획수량, 계획일자 등을 관리하여 생산 계획을 체계적으로 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 계획을 등록하고 작업지시를 생성하여 공정별 생산 일정을 관리할 수 있습니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="생산계획관리 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 생산계획관리에서는 생산 계획 정보를 등록하고 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 계획번호, 제품 정보, 주/야간 유형, 계획수량, 계획일자 등을 관리하여 생산 계획을 체계적으로 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 생산 계획 정보는 작업 지시, 생산 실적 관리 등에서 활용됩니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 주문번호와 연계된 생산계획을 등록하여 주문-생산-출하 프로세스를 통합적으로 관리할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default ProductionPlanManagement;
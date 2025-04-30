// useProductionPlanManagement.js - 제품 정보 로드 및 캐싱 기능 추가

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGridRow } from '../../../../utils/grid/useGridRow';
import Message from '../../../../utils/message/Message';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import CustomDateEditor from '../editors/CustomDateEditor';
import ShiftTypeEditor from '../editors/ShiftTypeEditor';
import ProductMaterialSelector from '../editors/ProductMaterialSelector';
import { enrichProductWithDisplayValues } from '../utils/materialTypeUtils';

// GraphQL 쿼리 정의
const PRODUCTION_PLANS_QUERY = gql`
    query getProductionPlans($filter: ProductionPlanFilter) {
        productionPlans(filter: $filter) {
            site
            compCd
            prodPlanId
            orderId
            orderDetailId
            productId
            productName
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

// 제품 정보 조회 쿼리 수정
const PRODUCT_MATERIALS_QUERY = gql`
    query getProductMaterials {
        productMaterials {
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            materialCategory
            materialType
            unit
        }
    }
`;

// 고객사 정보 조회 쿼리 추가
const VENDORS_QUERY = gql`
    query getVendors($filter: VendorFilter) {
        getVendors(filter: $filter) {
            vendorId
            vendorName
            vendorType
            businessRegNo
            ceoName
            businessType
            address
            telNo
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

/**
 * 생산계획관리 컴포넌트의 로직을 처리하는 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 생산계획관리 관련 상태와 핸들러
 */
export const useProductionPlanManagement = (tabId) => {
  // API 연동 및 유틸리티
  const { executeQuery, executeMutation } = useGraphQL();
  const { formatDateToYYYYMMDD, generateId } = useGridUtils();
  const { loginUser } = useLocalStorageVO();

  // React Hook Form 설정
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      prodPlanId: '',
      orderId: '',
      orderDetailId: '',
      productId: '',
      productName: '',
      materialCategory: '',
      shiftType: '',
      planStartDateRange: {  // 이름 수정
        startDate: null,
        endDate: null
      },
      planEndDateRange: {    // 추가: 계획종료일 범위
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

  // 제품 정보 상태 추가
  const [productMaterials, setProductMaterials] = useState([]);
  const [isProductMaterialsLoaded, setIsProductMaterialsLoaded] = useState(false);
  
  // 고객사 정보 상태 추가
  const [vendors, setVendors] = useState([]);
  const [isVendorsLoaded, setIsVendorsLoaded] = useState(false);

  // 제품 정보를 ID 기준으로 맵핑하는 객체 생성 (메모이제이션)
  const productMap = useMemo(() => {
    const map = {};
    productMaterials.forEach(product => {
      if (product.systemMaterialId) {
        // 이미 enrichProductWithDisplayValues를 통해 처리된 데이터이므로
        // 여기서는 그대로 맵에 추가
        map[product.systemMaterialId] = product;
      }
    });
    return map;
  }, [productMaterials]);

  // 고객사 정보를 ID 기준으로 맵핑하는 객체 생성 (메모이제이션)
  const vendorMap = useMemo(() => {
    const map = {};
    vendors.forEach(vendor => {
      if (vendor.vendorId) {
        map[vendor.vendorId] = vendor;
      }
    });
    return map;
  }, [vendors]);

  // 제품 정보 로드 함수
  const loadProductMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await executeQuery({ query: PRODUCT_MATERIALS_QUERY });

      if (response?.data?.productMaterials) {
        console.log("제품 정보 로드 성공:", response.data.productMaterials.length);

        // 제품 정보에 표시값 추가
        const enrichedProducts = response.data.productMaterials.map(
            product => enrichProductWithDisplayValues(product)
        );

        setProductMaterials(enrichedProducts);
        setIsProductMaterialsLoaded(true);

        // 제품 정보 로드 후, 현재 planList에 있는 행들의 제품명 업데이트
        setPlanList(prev => {
          return prev.map(plan => {
            const product = enrichedProducts.find(
                p => p.systemMaterialId === plan.productId
            );

            if (product && !plan.productName) {
              return { ...plan, productName: product.materialName || '' };
            }

            return plan;
          });
        });
      } else {
        console.error("제품 정보 로드: 데이터가 없습니다.", response);
        Message.showWarning('제품 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error("제품 정보 로드 오류:", error);
      Message.showError({ message: '제품 정보를 불러오는데 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  }, [executeQuery]);

  // 고객사 정보 로드 함수
  const loadVendors = useCallback(async () => {
    try {
      const response = await executeQuery({
        query: VENDORS_QUERY,
        variables: {
          filter: {
            vendorId: "",
            vendorName: "",
            ceoName: "",
            businessType: ""
          }
        }
      });

      if (response?.data?.getVendors) {
        console.log("고객사 정보 로드 성공:", response.data.getVendors.length);
        setVendors(response.data.getVendors);
        setIsVendorsLoaded(true);
      } else {
        console.error("고객사 정보 로드: 데이터가 없습니다.", response);
      }
    } catch (error) {
      console.error("고객사 정보 로드 오류:", error);
    }
  }, [executeQuery]);

  // API 통신 시 Date 객체를 문자열로 변환하는 함수
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
      orderDetailId: '',
      productId: '',
      productName: '', // 제품명 필드 추가
      materialCategory: '', // 제품유형 필드 추가
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
      orderDetailId: row.orderDetailId || '',
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
      orderDetailId: row.orderDetailId || '',
      productId: row.productId || '',
      shiftType: row.shiftType || 'DAY',
      planQty: parseFloat(row.planQty) || 0,
      planStartDate: formatDateToString(row.planStartDate),
      planEndDate: formatDateToString(row.planEndDate),
      flagActive: row.flagActive === undefined ? true : Boolean(row.flagActive)
    })
  });

  // 제품명을 캐싱된 제품 정보에서 조회하여 채우는 함수
  const enrichPlanListWithProductNames = useCallback((plans) => {
    return plans.map(plan => {
      const productId = plan.productId;
      let productName = '';

      // 제품ID가 있고 productMap에 해당 ID가 존재하면 제품명 채우기
      if (productId && productMap[productId]) {
        productName = productMap[productId].materialName || '';
      }

      return {
        ...plan,
        productName
      };
    });
  }, [productMap]);

  // 그리드 데이터 포맷 함수
  const formatGridData = useCallback((data) => {
    if (!data?.productionPlans) {
      return [];
    }

    let formattedData = data.productionPlans.map((plan) => {
      // 기본 필드 포맷
      const formattedPlan = {
        ...plan,
        id: plan.prodPlanId,
        planQty: plan.planQty ? Number(plan.planQty) : 0,
        planStartDate: plan.planStartDate ? new Date(plan.planStartDate) : null,
        planEndDate: plan.planEndDate ? new Date(plan.planEndDate) : null,
        createDate: plan.createDate ? new Date(plan.createDate) : null,
        updateDate: plan.updateDate ? new Date(plan.updateDate) : null
      };

      // 제품 정보 업데이트
      // productId가 있고 제품 정보맵에서 찾을 수 있는 경우
      if (plan.productId && productMap[plan.productId]) {
        const product = productMap[plan.productId];
        // productName이 없는 경우에만 설정 (기존 productName이 있으면 유지)
        if (!formattedPlan.productName) {
          formattedPlan.productName = product.materialName || '';
        }
        // materialCategory 설정
        formattedPlan.materialCategory = product.materialCategory || '';
      }

      return formattedPlan;
    });

    return formattedData;
  }, [productMap]);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      prodPlanId: '',
      orderId: '',
      orderDetailId: '',
      productId: '',
      productName: '',
      materialCategory: '',
      shiftType: '',
      planStartDateRange: {  // 이름 수정
        startDate: null,
        endDate: null
      },
      planEndDateRange: {    // 추가: 계획종료일 범위
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((fieldName, startDate, endDate) => {
    setValue(fieldName, { startDate, endDate });
  }, [setValue]);
  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setIsLoading(true);
    setUpdatedRows([]);
    setAddRows([]);

    // 필터 데이터 생성
    const filterData = { ...data };

    // planStartDateRange 객체에서 시작일 범위를 추출하여 필터 데이터로 변환
    if (filterData.planStartDateRange) {
      if (filterData.planStartDateRange.startDate) {
        try {
          filterData.planStartDateFrom = format(filterData.planStartDateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.planStartDateFrom = null;
        }
      }

      if (filterData.planStartDateRange.endDate) {
        try {
          filterData.planStartDateTo = format(filterData.planStartDateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.planStartDateTo = null;
        }
      }

      // planStartDateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.planStartDateRange;
    }

    // planEndDateRange 객체에서 종료일 범위를 추출하여 필터 데이터로 변환 (추가)
    if (filterData.planEndDateRange) {
      if (filterData.planEndDateRange.startDate) {
        try {
          filterData.planEndDateFrom = format(filterData.planEndDateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDateFrom:", error);
          filterData.planEndDateFrom = null;
        }
      }

      if (filterData.planEndDateRange.endDate) {
        try {
          filterData.planEndDateTo = format(filterData.planEndDateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDateTo:", error);
          filterData.planEndDateTo = null;
        }
      }

      // planEndDateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.planEndDateRange;
    }
    
    // materialCategory 필드 처리 - 빈 문자열인 경우 제거
    if (filterData.materialCategory === '') {
      delete filterData.materialCategory;
    }

    executeQuery({ query: PRODUCTION_PLANS_QUERY, variables: { filter: filterData } })
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
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
      setIsLoading(false);
      // 에러 발생 시 빈 배열 설정으로 UI 렌더링은 정상적으로 진행
      setPlanList([]);
    });
  }, [executeQuery, formatGridData, setUpdatedRows, setAddRows]);

  // 계획 선택 핸들러
  const handlePlanSelect = useCallback((params) => {
    const plan = planList.find(p => p.id === params.id);
    setSelectedPlan(plan);
  }, [planList]);

  // 행 업데이트 처리 핸들러
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    const isNewRow = oldRow.id.toString().startsWith('NEW_');

    // 깊은 복제로 원본 데이터 보존
    const processedRow = { ...newRow };

    // planQty 필드 명시적 처리
    if (processedRow.planQty === undefined || processedRow.planQty === null || processedRow.planQty === '') {
      processedRow.planQty = 0;
    } else if (typeof processedRow.planQty === 'string') {
      // 문자열인 경우 숫자로 변환
      processedRow.planQty = Number(processedRow.planQty.replace(/,/g, ''));
      if (isNaN(processedRow.planQty)) {
        processedRow.planQty = 0;
      }
    }

    // 제품 정보 일관성 확인
    // 제품ID가 변경되었을 때 제품명과 제품유형 자동 업데이트
    if (processedRow.productId !== oldRow.productId) {
      const product = productMaterials.find(p => p.systemMaterialId === processedRow.productId);
      if (product) {
        processedRow.productName = product.materialName || '';
        processedRow.materialCategory = product.materialCategory || '';
      }
    }
    // 제품명이 변경되었을 때 제품ID와 제품유형 자동 업데이트
    else if (processedRow.productName !== oldRow.productName) {
      const product = productMaterials.find(p => p.materialName === processedRow.productName);
      if (product) {
        processedRow.productId = product.systemMaterialId || '';
        processedRow.materialCategory = product.materialCategory || '';
      }
    }
    // 그리드 상태 업데이트
    setPlanList((prev) => {
      return prev.map((row) => row.id === oldRow.id ? { ...row, ...processedRow } : row);
    });

    if (isNewRow) {
      setAddRows((prevAddRows) => {
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
      setUpdatedRows((prevUpdatedRows) => {
        const existingIndex = prevUpdatedRows.findIndex(row => row.prodPlanId === oldRow.prodPlanId);
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
  }, [setAddRows, setUpdatedRows, productMaterials]);

  // 등록 버튼 클릭 핸들러
  const handleAdd = useCallback(() => {
    const newRow = createNewRow();
    setPlanList(prev => [newRow, ...prev]);
    setAddRows(prev => [newRow, ...prev]);
    // 새 행이 추가된 후 약간의 딜레이 후 편집 모드로 전환
    setTimeout(() => {
      // 여기서 제품ID 셀을 클릭하거나 편집 모드로 전환하는 로직 추가
      // MUI DataGrid에서는 api를 통해 접근해야 함
      const rowId = newRow.id;
      // 노트: 여기서 실제 DataGrid API에 접근하여 편집 모드 활성화 코드 필요
    }, 100);
  }, [createNewRow, setAddRows]);

  // 저장 버튼 클릭 핸들러
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
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            if (field === 'productId') {
              Message.showError({ message: "제품 ID는 필수 입력 항목입니다." });
            } else {
              Message.showError({ message: `${field} 필드는 필수 입력값입니다.` });
            }
            return false;
          }
        }
      }
      return true;
    };

    // 필수 필드 검증
    const requiredFields = ['productId'];
    if (!validateRequiredFields(newRows, requiredFields) || !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }

    // 생성할 행 변환 - GraphQL 스키마에 맞게 필드 조정
    const createdPlanInputs = newRows.map(row => ({
      orderId: row.orderId || '',
      orderDetailId: row.orderDetailId || '',
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
      const currentRow = planList.find(row => row.prodPlanId === updatedRow.prodPlanId) || updatedRow;

      return {
        prodPlanId: currentRow.prodPlanId,
        orderId: currentRow.orderId || '',
        orderDetailId: currentRow.orderDetailId || '',
        productId: currentRow.productId || '',
        shiftType: currentRow.shiftType || 'DAY',
        planQty: parseFloat(currentRow.planQty) || 0,
        planStartDate: formatDateToString(currentRow.planStartDate),
        planEndDate: formatDateToString(currentRow.planEndDate),
        flagActive: currentRow.flagActive === undefined ? true : Boolean(currentRow.flagActive)
      };
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
      Message.showError({ message: errorMessage });
    });
  }, [planList, updatedRows, setAddRows, setUpdatedRows, executeMutation, formatDateToString, handleSearch, getValues]);

  // 삭제 버튼 클릭 핸들러
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
        variables: { prodPlanId: selectedPlan.prodPlanId }
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
        Message.showError({ message: '삭제 중 오류가 발생했습니다.' });
      });
    });
  }, [selectedPlan, planList, setAddRows, executeMutation]);

  // 컴포넌트 마운트 시 제품 정보 및 고객사 정보 로드
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        console.log("초기 데이터 로드 시작...");

        // 1. 제품 정보 먼저 로드
        await loadProductMaterials();
        console.log("제품 정보 로드 완료, 제품 수:", productMaterials.length);

        // 2. 고객사 정보 로드
        await loadVendors();
        console.log("고객사 정보 로드 완료, 고객사 수:", vendors.length);

        // 3. 제품 정보 및 고객사 정보 로드 후 생산계획 목록 조회
        if (isMounted) {
          handleSearch({});
        }
      } catch (err) {
        console.error("초기 데이터 로드 오류:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 초기 정렬 상태 설정 - 생산계획ID 기준 내림차순 정렬
  const initialState = useMemo(() => ({
    sorting: {
      sortModel: [{ field: 'prodPlanId', sort: 'desc' }]
    }
  }), []);

  return {
    // 검색폼 상태 및 핸들러
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 생산계획 관련 상태 및 핸들러
    isLoading,
    planList,
    selectedPlan,
    handlePlanSelect,
    handleAdd,
    handleSave,
    handleDelete,
    handleProcessRowUpdate,

    // 제품 정보 관련 상태
    productMaterials,
    isProductMaterialsLoaded,

    // 고객사 정보 관련 상태 추가
    vendors,
    isVendorsLoaded,
    vendorMap,

    // 에디터 컴포넌트
    CustomDateEditor,
    ShiftTypeEditor,
    ProductMaterialSelector,

    // 그리드 속성
    initialState,

    // 리프레시 키
    refreshKey
  };
};

export default useProductionPlanManagement;
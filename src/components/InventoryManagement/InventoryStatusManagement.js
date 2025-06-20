import React, { useState, useEffect, useCallback } from 'react';
import './ReceivingManagement.css';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, 
  Grid, 
  Box, 
  Typography, 
  useTheme,
  IconButton,
  alpha
} from '@mui/material';
import { SearchCondition, EnhancedDataGridWrapper } from '../Common';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import { GRAPHQL_URL } from '../../config';
import { getInventoryStatusList } from '../../api/standardInfo/inventoryApi';


const InventoryStatusManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
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
  
  // React Hook Form 설정
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      warehouseName: '',
      supplierName: '',
      manufacturerName: '',
      materialName: '',
    }
  });

  // 초기화 함수
  const handleReset = () => {
    reset({
      warehouseName: '',
      supplierName: '',
      manufacturerName: '',
      materialName: '',
    });
  };
  

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  const [receivingList, setReceivingList] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 추가 코드 
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링용 키
  const [addRows,setAddRows] = useState([]);
  const [updatedDetailRows, setUpdatedDetailRows] = useState([]); // 수정된 필드만 저장하는 객체

  // 공장 타입 옵션
  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  // 창고 타입 옵션
  const [warehouseTypeOptions, setWarehouseTypeOptions] = useState([]);

  const GET_INVENTORY_STATUS_LIST = `
    query getInventoryStatusList($filter: InventoryStatusFilter) {
      getInventoryStatusList(filter: $filter) {
        warehouseName
        supplierName
        manufacturerName
        systemMaterialId
        materialName
        unit
        qty
      }
    }
  `

  function fetchGridWarehouse() {
    const query = `
    query getGridWarehouse {
      getGridWarehouse {
        warehouseId
        warehouseName
        warehouseType
      }
    }
  `;

  return new Promise((resolve, reject) => {
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query
      })
    }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).then((data) => {
          if (data.errors) {
            console.error(data.errors);
            reject(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.data.getGridWarehouse.map((row) => ({
              value: row.warehouseId,
              label: row.warehouseName
            }));
            setWarehouseTypeOptions(options);
            resolve(options);
          }
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  // 검색 실행 함수
  const handleSearch = useCallback(async (data) => {
    setUpdatedDetailRows([]);
    setAddRows([]);

    console.log('검색 데이터:', data);

    try {
      const filter = {
        warehouseName: data.warehouseName || null,
        supplierName: data.supplierName || null,
        manufacturerName: data.manufacturerName || null,
        materialName: data.materialName || null,
      };

      console.log('GraphQL 필터:', filter);

      try {
        const result = await getInventoryStatusList(filter);
        console.log('파싱된 결과:', result);
        
        if (result) {
          // 받아온 데이터로 상태 업데이트
          setReceivingList(result.map((item, index) => ({
            id: item.systemMaterialId || `status_${index}_${Date.now()}`,
            warehouseName: item.warehouseName,
            supplierName: item.supplierName,
            manufacturerName: item.manufacturerName,
            systemMaterialId: item.systemMaterialId,
            materialName: item.materialName,
            unit: item.unit,
            qty: parseFloat(item.qty) || 0
          })));
          
        } else {
          console.error('응답 데이터가 예상 형식과 다릅니다:', result);
          setReceivingList([]);
          
          Swal.fire({
            icon: 'info',
            title: '알림',
            text: '데이터를 가져오지 못했습니다. 백엔드 연결을 확인해주세요.'
          });
        }
      } catch (error) {
        console.error('데이터 조회 오류:', error);
        setReceivingList([]); // 오류 발생 시 빈 배열로 설정
        
        Swal.fire({
          icon: 'error',
          title: '데이터 조회 실패',
          text: `오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`
        });
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      setReceivingList([]); // 오류 발생 시 빈 배열로 설정
      
      Swal.fire({
        icon: 'error',
        title: '데이터 조회 실패',
        text: `오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`
      });
    }
  }, []);


  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      handleSearch({});
      fetchGridWarehouse();
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [handleSearch]);

  // 재고 목록 그리드 컬럼 정의
  const receivingColumns = [
    { field: 'warehouseName', 
      headerName: '창고', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      valueOptions: warehouseTypeOptions,
      flex: 1,
     }, 
    { field: 'supplierName', 
      headerName: '공급업체', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
      },
    { field: 'manufacturerName', 
      headerName: '제조사', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
      },
    { field: 'systemMaterialId', 
      headerName: '자재ID', 
      width: 120,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      type: 'singleSelect',
      flex: 1,
     },
    { field: 'materialName', 
      headerName: '자재명', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      flex: 1,
      },
    { field: 'unit', 
      headerName: '단위', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
     },
    { field: 'qty', 
      headerName: '현재수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      renderCell: (params) => {
        const value = params.value;
        
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
            </Typography>
          </Box>
        );
      },
     },
  ];

  // 재고 목록 그리드 버튼
  const receivingGridButtons = [
    // { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    // { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    // { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> },
  ];

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
          자재 / 재고현황
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

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="warehouseName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="창고이름"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="창고이름을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="supplierName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공급업체"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공급업체를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="manufacturerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제조사"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제조사를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="자재"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재를 입력하세요"
              />
            )}
          />
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={1}>
          {/* 재고 기본 정보 그리드 */}
          <Grid item xs={12} md={12}>
          <EnhancedDataGridWrapper
              title="재고 현황"
              key={refreshKey}  // refreshKey가 변경되면 전체 그리드가 재마운트됩니다.
              rows={receivingList}
              columns={receivingColumns}
              buttons={receivingGridButtons}
              height={710}
              // onRowClick={handleReceivingSelect}
              tabId={props.tabId + "-factories"}
              gridProps={{
                editMode: 'cell',
                sx: {
                  '& .MuiDataGrid-cell': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }
              }}
              />
          </Grid>
        </Grid>
      )}

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="자재/재고현황 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 자재/재고현황에서는 각 창고별 자재의 현재 재고 수량을 조회할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 창고, 품목유형, 자재코드, 자재명으로 검색하여 원하는 자재의 재고를 확인할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 재고 수량이 안전재고 수량보다 적은 경우 경고 표시가 나타납니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default InventoryStatusManagement;  


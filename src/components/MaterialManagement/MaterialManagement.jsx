import React, { useState, useEffect } from 'react';
import './MaterialManagement.css';
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
  Stack
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import { MATERIAL_QUERY, MATERIAL_MUTATION, DELETE_MUTATION } from '../../graphql/queries/materialQueries';
import { useQuery, useMutation } from '@apollo/client';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import { format } from 'date-fns';
import ko from "date-fns/locale/ko";
import Message from '../../utils/Message';

const MaterialManagement = ({ tabId }) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      materialType: '',
      materialId: '',
      materialName: '',
      flagActive: '',
      fromDate: null,
      toDate: null
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [materialList, setMaterialList] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleReset = () => {
    reset({
      materialType: '',
      materialId: '',
      materialName: '',
      flagActive: '',
      fromDate: null,
      toDate: null
    });
  };

  const { loading, error, data, refetch } = useQuery(MATERIAL_QUERY, {
    variables: {
        filter: {
            materialType: '',
            systemMaterialId: '',
            userMaterialId: '',
            materialName: '',
            flagActive: null,
            fromDate: null,
            toDate: null
        }
    }
});


  const [saveMaterials] = useMutation(MATERIAL_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const [deleteMaterials] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleSearch = async (data) => {
    try {
        const result = await refetch({
            filter: {
                materialType: data.materialType || '',
                systemMaterialId: data.materialId || '',
                userMaterialId: '',
                materialName: data.materialName || '',
                flagActive: data.flagActive || null,
                fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
                toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
            }
        });
        
        if (result.data?.materials) {
            const materials = result.data.materials.map(material => ({
                ...material,
                id: material.id || `NEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                flagActive: material.flagActive === null ? 'N' : (material.flagActive ? 'Y' : 'N')
            }));
            setMaterialList(materials);
            setRefreshKey(prev => prev + 1);
        }
    } catch (error) {
        Message.showError(error);
    }
};

  const handleAdd = () => {
    const newMaterial = {
        seq: null,
        materialType: '',
        systemMaterialId: '',
        userMaterialId: '',
        materialName: '',
        materialStandard: '',
        unit: '',
        minQuantity: 0,
        maxQuantity: 0,
        manufacturerName: '',
        supplierName: '',
        materialStorage: '',
        flagActive: 'Y',
        createUser: '시스템',
        createDate: new Date().toISOString().split('T')[0],
        updateUser: '시스템',
        updateDate: new Date().toISOString().split('T')[0],
        id: `NEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setMaterialList([...materialList, newMaterial]);
};

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const materialsToSave = materialList.map(material => ({
        ...material,
        flagActive: material.flagActive,
        updateDate: new Date().toISOString().split('T')[0],
        updateUser: '시스템'
      }));

      await saveMaterials({
        variables: {
          materials: materialsToSave
        }
      });
      
      Message.showSuccess(Message.SAVE_SUCCESS);
    } catch (error) {
      Message.showError(error, setIsLoading);
    }
  };

  const handleDelete = async () => {
    const selectedRows = materialList.filter(material => material.selected);
    
    if (selectedRows.length === 0) {
      Message.showWarning(Message.NO_SELECTED_ROWS);
      return;
    }

    Message.showDeleteConfirm(async () => {
      setIsLoading(true);
      try {
        await deleteMaterials({
          variables: {
            ids: selectedRows.map(row => row.id)
          }
        });
        
        Message.showSuccess(Message.DELETE_SUCCESS);
      } catch (error) {
        Message.showError(error, setIsLoading);
      }
    });
  };

  useEffect(() => {
    if (data?.materials) {
      const materials = data.materials.map(material => ({
        ...material,
        id: material.id || `NEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        flagActive: material.flagActive === null ? 'N' : (material.flagActive ? 'Y' : 'N')
      }));
      setMaterialList(materials);
      setIsLoading(false);
    }
  }, [data]);

  const materialColumns = [
    { field: 'materialType', headerName: '자재종류', width: 100 },
    { field: 'systemMaterialId', headerName: '시스템자재ID', width: 120 },
    { field: 'userMaterialId', headerName: '사용자자재ID', width: 120 },
    { field: 'materialName', headerName: '자재명', width: 180, flex: 1 },
    { field: 'materialStandard', headerName: '규격', width: 120 },
    { field: 'unit', headerName: '단위', width: 70 },
    { field: 'minQuantity', headerName: '최소수량', width: 80, type: 'number' },
    { field: 'maxQuantity', headerName: '최대수량', width: 80, type: 'number' },
    { field: 'manufacturerName', headerName: '제조사명', width: 120 },
    { field: 'supplierName', headerName: '공급업체명', width: 120 },
    { field: 'materialStorage', headerName: '보관창고', width: 120 },
    {
        field: 'flagActive',
        headerName: '사용여부',
        width: 100,
        type: 'string',
        valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
        editable: true,
        valueOptions: ['Y', 'N']
    }
];


  const materialGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: null },
    { label: '행추가', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
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
          원/부자재관리
        </Typography>
      </Box>

      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="materialType-label">자재종류</InputLabel>
                <Select
                  {...field}
                  labelId="materialType-label"
                  label="자재종류"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="원자재">원자재</MenuItem>
                  <MenuItem value="부자재">부자재</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="자재 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재ID를 입력하세요"
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
                label="자재명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="자재명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="flagActive"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="flagActive-label">사용여부</InputLabel>
                <Select
                  {...field}
                  labelId="flagActive-label"
                  label="사용여부"
                  value={field.value || ''}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Y">사용</MenuItem>
                  <MenuItem value="N">미사용</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="시작일"
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
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="종료일"
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
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MuiDataGridWrapper
            title="원/부자재 목록"
            key={refreshKey}
            rows={materialList}
            columns={materialColumns}
            buttons={materialGridButtons}
            height={500}
            gridProps={{
              editMode: 'row',
              checkboxSelection: true
            }}
          />
        </Grid>
      </Grid>
      
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 원/부자재관리에서는 제품 생산에 필요한 원자재와 부자재 정보를 관리합니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 행추가 버튼을 클릭하여 새로운 자재를 등록할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 각 행을 직접 수정한 후 저장 버튼을 클릭하여 변경사항을 저장할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default MaterialManagement; 
import React, {useState, useEffect, useCallback} from 'react';
import './FactoryManagement.css';
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';
import Message from "../../utils/message/Message";
import {deleteFactory, getFactory, saveFactory} from "../../api/standardInfo/factoryApi";
import {useSelectionModel} from "../../utils/grid/useGridRow";

const FactoryManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // React Hook Form 설정
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      factoryCode: '',
    }
  });
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [factoryList, setFactoryList] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링용 키
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const {
    selectionModel,            // 선택된 ID 배열
    onSelectionModelChange,    // DataGrid에 넘길 핸들러
    removeSelectedRows
  } = useSelectionModel([], setAddRows, setUpdatedRows, setFactoryList);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      getFactory(
          getValues()
      ).then((data) => {
        if (data.errors) {
        } else {
          const rowsWithId = data.map((row, index) => ({
            ...row,
            id: row.factoryId  // 또는 row.factoryId || index + 1
          }));
          setFactoryList(rowsWithId);
        }
        setIsLoading(false);
      })
          .catch((err) => {
            setIsLoading(false);
          });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 공장 목록 그리드 컬럼 정의
  const factoryColumns = [
    { field: 'factoryId', headerName: '공장 ID', width: 150 },
    {
      field: 'factoryName',
      headerName: '공장 명',
      width: 150 ,
      editable: true,
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');

        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');

        return (
            <Typography variant="body2" sx={{color: showRequired ? '#f44336' : 'inherit'}}>
              {showRequired ? '필수 입력' : params.value || ''}
            </Typography>
        );
      }
    },
    { field: 'factoryCode', headerName: '공장 코드', width: 100, editable: true  },
    { field: 'address', headerName: '주소', width: 200, flex: 1, editable: true },
    { field: 'telNo', headerName: '전화번호', width: 150, editable: true },
    { field: 'remark', headerName: '비고', width: 100, editable: true},
    { field: 'createUser', headerName: '작성자', width: 100},
    { field: 'createDate', headerName: '작성일', width: 200},
    { field: 'updateUser', headerName: '수정자', width: 100},
    { field: 'updateDate', headerName: '수정일', width: 200},
  ];

  // 검색 조건 변경 핸들러
  const handleSearch = (data) => {
   // 검색후 업데이트 로우 초기화
    setUpdatedRows([]);
    setAddRows([]);


    getFactory(data)
        .then((data) => {
          if (data.errors) {
          } else {
            const rowsWithId = data.map((row, index) => ({
              ...row,
              id: row.factoryId  // 또는 row.factoryId || index + 1
            }));
            setFactoryList(rowsWithId);
            setRefreshKey(prev => prev + 1);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
        });
  };

  // 초기화 함수
  const handleReset = () => {
    reset({
      factoryId: '',
      factoryName: '',
      factoryCode: '',
    });
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {

    const addRowQty = addRows.length;
    const updateRowQty = updatedRows.length;

    if(addRowQty + updateRowQty === 0 ){
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '변경사항이 존재하지 않습니다.',
        confirmButtonText: '확인'
      });
      return;
    }

    // 필수 필드 검증 함수
    const validateRequiredFields = (rows, fieldMapping) => {
      for (const row of rows) {
        for (const field of Object.keys(fieldMapping)) {
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            Message.showError({ message: `${fieldMapping[field]} 필드는 필수 입력값입니다.` });
            return false;
          }
        }
      }
      return true;
    };

    // 필수 필드 검증
    const requiredFields = {
      factoryName: '공장명'
    };

    if (!validateRequiredFields(addRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }

    const createdFactoryInputs = addRows.map(transformRowForMutation);
    const updatedFactoryInputs = updatedRows.map(transformRowForUpdate);


    saveFactory(
        {
          createdRows: createdFactoryInputs,
          updatedRows: updatedFactoryInputs,
        }
    ).then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
          } else {
            handleSearch(getValues());
            Swal.fire({
              icon: 'success',
              title: '성공',
              text: '저장되었습니다.',
              confirmButtonText: '확인'
            });
          }
        })
        .catch((error) => {
          console.error("Error save factory:", error);
        });
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newFactory = {
      id: `NEW_${Date.now()}`,
      factoryId: '자동입력',
      factoryName: '',
      factoryCode: '',
      address: '',
      telNo: '',
      remark: '',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력'
    };

    setFactoryList([newFactory, ...factoryList]);

  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (selectionModel.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 공장을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    Swal.fire({
      title: '삭제 확인',
      text: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // 백엔드 삭제 요청 (GraphQL)

        deleteFactory(
            {factoryIds: selectionModel}
        ).then((data) => {
              if (data.errors) {
                console.error("GraphQL errors:", data.errors);
                Swal.fire({
                  icon: 'error',
                  title: '삭제 실패',
                  text: '삭제 중 오류가 발생했습니다.'
                });
              } else {
                // 삭제 성공 시, 로컬 상태 업데이트
                removeSelectedRows(selectionModel);
                // clearSelection();
                Swal.fire({
                  icon: 'success',
                  title: '성공',
                  text: '삭제되었습니다.',
                  confirmButtonText: '확인'
                });
              }
            })
            .catch((error) => {
              console.error("Error deleting factory:", error);
              Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '삭제 중 예외가 발생했습니다.'
              });
            });
      }
    });
  };

  // 공장 목록 그리드 버튼
  const factoryGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  // FactoryInput으로 보낼 데이터만 골라내는 함수
  const transformRowForMutation = (row) => ({
    factoryName: row.factoryName,
    factoryCode: row.factoryCode,
    address: row.address,
    telNo: row.telNo,
    remark: row.remark,
  });

  const transformRowForUpdate = (row) => ({
    factoryId: row.factoryId,
    factoryName: row.factoryName,
    factoryCode: row.factoryCode,
    address: row.address,
    telNo: row.telNo,
    remark: row.remark,
  });


  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setFactoryList((prev) => {
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.id === oldRow.id ? { ...row, ...newRow } : row
      );
    });

    if (isNewRow) {
      // 신규 행인 경우 addRows 상태에 추가 (같은 id가 있으면 덮어씀)
      setAddRows((prevAddRows) => {
        const existingIndex = prevAddRows.findIndex(
            (row) => row.id === newRow.id
        );
        if (existingIndex !== -1) {
          const updated = [...prevAddRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {
          return [...prevAddRows, newRow];
        }
      });
    }else {
      setUpdatedRows(prevUpdatedRows => {
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.factoryId === newRow.factoryId);

        if (existingIndex !== -1) {

          // 기존에 같은 factoryId가 있다면, 해당 객체를 새 값(newRow)으로 대체
          const updated = [...prevUpdatedRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {

          // 없다면 새로 추가
          return [...prevUpdatedRows, newRow];
        }
      });
    }

    // processRowUpdate에서는 최종적으로 반영할 newRow(또는 updatedRow)를 반환해야 함
    return { ...oldRow, ...newRow };
  }

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
          공장정보관리
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
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="factoryId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="factoryName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장 명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="factoryCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장코드를 입력하세요"
              />
            )}
          />
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
          <Grid item xs={12}>
            <EnhancedDataGridWrapper
              title="공장 목록"
              rows={factoryList}
              columns={factoryColumns}
              buttons={factoryGridButtons}
              height={640}
              tabId={props.tabId + "-factories"}
              gridProps={{
                checkboxSelection: true,
                onSelectionModelChange: onSelectionModelChange,
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
            />
          </Grid>
      )}

      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="공장정보관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 공장관리에서는 기업의 공장 시설 정보를 등록, 수정, 삭제할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 공장별 공장명, 공장코드, 주소, 전화번호, 비고 등 기본 정보를 관리하여 생산 환경을 효율적으로 관리할 수 있습니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default FactoryManagement; 
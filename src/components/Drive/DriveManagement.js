import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Button,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SaveIcon from '@mui/icons-material/Save';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import { getAllFiles, deleteFile, uploadFile, getMenus, updateFiles, downloadFile } from '../../api/driveApi';
import Message from '../../utils/message/Message';

const DriveManagement = () => {
  const [files, setFiles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [selectUploadFile, setSelectUploadFile] = useState(null);
  const [modifiedRows, setModifiedRows] = useState({});
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    loadFiles();
    loadMenus();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getAllFiles();
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      const data = await getMenus();
      setMenus(data || []);
    } catch (error) {
      console.error('Error loading menus:', error);
      setMenus([]);
    }
  };

  const getFileIcon = (extension) => {
    if (!extension) return <InsertDriveFileIcon />;
    
    extension = extension.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ color: '#FF4444' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon sx={{ color: '#4444FF' }} />;
      case 'doc':
      case 'docx':
      case 'hwp':
      case 'txt':
        return <ArticleIcon sx={{ color: '#4444FF' }} />;
      case 'xls':
      case 'xlsx':
      case 'csv':
      case 'fods':
        return <TableChartIcon sx={{ color: '#44AA44' }} />;
      case 'ppt':
      case 'pptx':
        return <DescriptionIcon sx={{ color: '#FF7744' }} />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const handleFileSelect = (event) => {
    setSelectUploadFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectUploadFile || !selectedMenu) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectUploadFile);
      formData.append('menuId', selectedMenu);

      await uploadFile(formData);
      Message.showSuccess('파일 업로드 성공');
      loadFiles();
      handleCloseUploadDialog();
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedMenu(null);
    setSelectUploadFile(null);
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await deleteFile(selectedFile.id);
      Message.showSuccess('파일 삭제 성공');
      loadFiles();
      handleMenuClose();
      setDeleteDialogOpen(false);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, file) => {
    setSelectedFile(file);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    return `${bytes} KB`;  // 백엔드에서 이미 KB 단위로 변환하여 전달
  };

  const processRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
      return oldRow;
    }

    const updatedRow = { ...newRow };
    setModifiedRows(prev => ({
      ...prev,
      [newRow.id]: {
        id: newRow.id,
        name: newRow.name !== oldRow.name ? newRow.name : undefined,
        menuId: newRow.menuId !== oldRow.menuId ? newRow.menuId : undefined
      }
    }));

    return updatedRow;
  };

  const handleProcessRowUpdateError = (error) => {
    Message.showError(error.message);
  };

  const handleSaveChanges = async () => {
    if (Object.keys(modifiedRows).length === 0) {
      Message.showInfo('변경된 내용이 없습니다.');
      return;
    }

    try {
      setLoading(true);
      const modifiedFiles = Object.values(modifiedRows).filter(row => 
        row.name !== undefined || row.menuId !== undefined
      );
      
      if (modifiedFiles.length === 0) {
        Message.showInfo('변경된 내용이 없습니다.');
        return;
      }

      await updateFiles(modifiedFiles);
      Message.showSuccess('파일 정보가 수정되었습니다.');
      setModifiedRows({});
      loadFiles();
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuName = (menuId) => {
    const menu = menus.find(m => m.menuId === menuId);
    return menu ? menu.menuName : menuId;
  };

  const handleDownload = async (id) => {
    try {
      setLoading(true);
      const response = await downloadFile(id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile.name + '.' + selectedFile.extension);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Message.showError('파일 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: '파일명',
      flex: 2.2,
      sortable: true,
      editable: true,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          width: '100%',
          height: '100%'
        }}>
          {getFileIcon(params.row.extension)}
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'extension',
      headerName: '확장자',
      flex: 0.6,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body2">
            {params.value ? params.value.toUpperCase() : ''}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'menuId',
      headerName: '메뉴',
      flex: 1,
      sortable: true,
      editable: true,
      align: 'center',
      headerAlign: 'center',
      type: 'singleSelect',
      valueOptions: menus.map(menu => ({
        value: menu.menuId,
        label: menu.menuName
      })),
      renderCell: (params) => (
        <Box sx={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body2">
            {getMenuName(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'size',
      headerName: '크기',
      flex: 0.8,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: 2
        }}>
          <Typography variant="body2">
            {formatFileSize(params.row.size)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.5,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconButton 
            size="small"
            onClick={(e) => handleMenuClick(e, params.row)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Paper sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
          backgroundColor: '#fafafa'
        }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
              파일 관리
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
                disabled={Object.keys(modifiedRows).length === 0}
                size="small"
                sx={{
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none'
                  }
                }}
              >
                변경사항 저장
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                size="small"
                sx={{
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none'
                  }
                }}
              >
                파일 업로드
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, width: '100%' }}>
          <DataGrid
            rows={files}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            disableSelectionOnClick
            autoPageSize
            sortingMode="server"
            rowHeight={40}
            headerHeight={40}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            experimentalFeatures={{ newEditingApi: true }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'name', sort: 'asc' }],
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.2)',
                padding: '0 16px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
                backgroundColor: '#fafafa',
                '& .MuiDataGrid-columnHeader': {
                  padding: '0 16px'
                }
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
          />
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            handleDownload(selectedFile.id);
            setAnchorEl(null);
          }}>
            <FileDownloadIcon sx={{ mr: 1 }} />
            다운로드
          </MenuItem>
          <MenuItem onClick={() => {
            setAnchorEl(null);
            setDeleteDialogOpen(true);
          }}>
            <DeleteIcon sx={{ mr: 1 }} />
            삭제
          </MenuItem>
        </Menu>

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>파일 삭제</DialogTitle>
          <DialogContent>
            <Typography>
              "{selectedFile?.name}.{selectedFile?.extension}" 파일을 삭제하시겠습니까?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button onClick={handleDeleteFile} color="error" variant="contained">
              삭제
            </Button>
          </DialogActions>
        </Dialog>

        {/* 파일 업로드 다이얼로그 */}
        <Dialog
          open={uploadDialogOpen}
          onClose={handleCloseUploadDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>파일 업로드</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>메뉴 선택</InputLabel>
                <Select
                  value={selectedMenu}
                  label="메뉴 선택"
                  onChange={(e) => setSelectedMenu(e.target.value)}
                >
                  {menus.map((menu) => (
                    <MenuItem key={menu.menuId} value={menu.menuId}>
                      {menu.menuName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    disabled={!selectedMenu}
                  >
                    {selectUploadFile ? selectUploadFile.name : '파일 선택'}
                  </Button>
                </label>
              </Box>
              {selectUploadFile && (
                <Typography variant="body2" color="textSecondary">
                  선택된 파일: {selectUploadFile.name} ({formatFileSize(selectUploadFile.size)})
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog}>취소</Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              color="primary"
              disabled={!selectedMenu || !selectUploadFile}
            >
              업로드
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default DriveManagement; 
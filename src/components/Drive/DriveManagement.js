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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getAllFiles, deleteFile, uploadFile } from '../../api/driveApi';
import Message from '../../utils/message/Message';

const DriveManagement = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getAllFiles();
      setFiles(data || []);
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('menuId', 'DRIVE'); // 메뉴 ID 설정

      await uploadFile(formData);
      Message.showSuccess('파일 업로드 성공');
      loadFiles();
    } catch (error) {
      Message.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await deleteFile(selectedFile.seq);
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      field: 'name',
      headerName: '파일명',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'extension',
      headerName: '확장자',
      flex: 1,
    },
    {
      field: 'size',
      headerName: '크기',
      flex: 1,
      valueFormatter: (params) => formatFileSize(params.value),
    },
    {
      field: 'actions',
      headerName: '작업',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleMenuClick(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 상단 도구 모음 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">파일 관리</Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              파일 업로드
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Stack>
        </Box>

        {/* 파일 목록 */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <DataGrid
            rows={files}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.seq}
            disableSelectionOnClick
            autoPageSize
          />
        </Box>

        {/* 컨텍스트 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            window.open(`${selectedFile?.path}/${selectedFile?.name}.${selectedFile?.extension}`, '_blank');
          }}>
            <FileDownloadIcon sx={{ mr: 1 }} />
            다운로드
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
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
              {selectedFile?.name}.{selectedFile?.extension} 파일을 삭제하시겠습니까?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button onClick={handleDeleteFile} color="error">삭제</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default DriveManagement; 
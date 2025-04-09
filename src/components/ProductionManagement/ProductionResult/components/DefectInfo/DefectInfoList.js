import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * 불량정보 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.defectList - 불량정보 목록 데이터
 * @param {Function} props.onOpenDefectModal - 불량정보 추가 모달 열기 핸들러
 * @param {Function} props.onEditDefect - 불량정보 수정 핸들러
 * @param {Function} props.onDeleteDefect - 불량정보 삭제 핸들러
 * @returns {JSX.Element}
 */
const DefectInfoList = ({
  defectList,
  onOpenDefectModal,
  onEditDefect,
  onDeleteDefect
}) => {
  return (
      <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 2
          }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">불량정보 목록</Typography>
          <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onOpenDefectModal}
          >
            불량정보 추가
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">불량 ID</TableCell>
                <TableCell align="center">불량명</TableCell>
                <TableCell align="center">수량</TableCell>
                <TableCell align="center">불량원인</TableCell>
                <TableCell align="center">상태</TableCell>
                <TableCell align="center">액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {defectList.length > 0 ? (
                  defectList.map((defect) => (
                      <TableRow key={defect.defectId}>
                        <TableCell align="center">{defect.defectId}</TableCell>
                        <TableCell align="center">{defect.defectName}</TableCell>
                        <TableCell align="center">{defect.defectQty}</TableCell>
                        <TableCell align="center">{defect.defectCause}</TableCell>
                        <TableCell align="center">
                          <Chip
                              label={defect.state === 'NEW' ? '신규' : defect.state}
                              size="small"
                              color={defect.state === 'NEW' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                                size="small"
                                onClick={() => onEditDefect(defect)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDeleteDefect(defect.defectId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                  ))
              ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      등록된 불량정보가 없습니다.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
  );
};

export default DefectInfoList;
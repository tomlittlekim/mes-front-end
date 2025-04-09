import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

/**
 * 불량정보 등록/수정 모달 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.open - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {Object} props.currentDefect - 현재 불량정보 객체
 * @param {Function} props.setCurrentDefect - 현재 불량정보 설정 함수
 * @param {boolean} props.isEditingDefect - 수정 모드 여부
 * @param {Function} props.onSave - 저장 핸들러
 * @param {Array} props.defectTypeOptions - 불량유형 옵션 목록
 * @returns {JSX.Element}
 */
const DefectInfoModal = ({
  open,
  onClose,
  currentDefect,
  setCurrentDefect,
  isEditingDefect,
  onSave,
  defectTypeOptions
}) => {
  return (
      <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
      >
        <DialogTitle>
          {isEditingDefect ? '불량정보 수정' : '불량정보 등록'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                  label="불량ID"
                  value={currentDefect.defectId || ''}
                  fullWidth
                  size="small"
                  margin="normal"
                  InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" margin="normal">
                <InputLabel id="defect-type-label">불량 유형*</InputLabel>
                <Select
                    labelId="defect-type-label"
                    label="불량 유형*"
                    value={currentDefect.defectName || ''}
                    onChange={(e) => setCurrentDefect(
                        { ...currentDefect, defectName: e.target.value })}
                >
                  {defectTypeOptions.map(option => (
                      <MenuItem key={option.value} value={option.label}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  label="불량 수량*"
                  value={currentDefect.defectQty || ''}
                  onChange={(e) => setCurrentDefect(
                      { ...currentDefect, defectQty: Number(e.target.value) })}
                  fullWidth
                  size="small"
                  type="number"
                  margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" margin="normal">
                <InputLabel id="defect-state-label">상태</InputLabel>
                <Select
                    labelId="defect-state-label"
                    label="상태"
                    value={currentDefect.state || 'NEW'}
                    onChange={(e) => setCurrentDefect(
                        { ...currentDefect, state: e.target.value })}
                >
                  <MenuItem value="NEW">신규</MenuItem>
                  <MenuItem value="PROCESSING">처리중</MenuItem>
                  <MenuItem value="COMPLETED">완료</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="불량 원인"
                  value={currentDefect.defectCause || ''}
                  onChange={(e) => setCurrentDefect(
                      { ...currentDefect, defectCause: e.target.value })}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button
              onClick={onSave}
              variant="contained"
              disabled={!currentDefect.defectName || !currentDefect.defectQty}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default DefectInfoModal;
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  useTheme,
  Divider,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Stack,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';

/**
 * 필드 선택 모달 컴포넌트
 * 출력/엑셀 시 포함할 필드 선택 및 등록자 정보 선택
 */
const FieldSelectionModal = ({
  open,
  onClose,
  title = '출력 필드 선택',
  fields = [],
  onConfirm,
  defaultSelectedFields = [],
  defaultUserFieldType = 'id' // 'id' | 'name'
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 선택된 필드들 상태
  const [selectedFields, setSelectedFields] = useState([]);
  // 등록자 필드 타입 상태 ('id': 아이디, 'name': 이름)
  const [userFieldType, setUserFieldType] = useState(defaultUserFieldType);

  // 모달이 열릴 때 기본값 설정
  useEffect(() => {
    if (open) {
      setSelectedFields(defaultSelectedFields.length > 0 ? defaultSelectedFields : fields.map(f => f.field));
      setUserFieldType(defaultUserFieldType);
    }
  }, [open, defaultSelectedFields, fields, defaultUserFieldType]);

  // 개별 필드 선택/해제
  const handleFieldToggle = (fieldName) => {
    setSelectedFields(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  // 전체 선택
  const handleSelectAll = () => {
    setSelectedFields(visibleFields.map(f => f.field));
  };

  // 전체 해제
  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  // 등록자 필드 타입 변경
  const handleUserFieldTypeChange = (event) => {
    setUserFieldType(event.target.value);
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    onConfirm({
      selectedFields,
      userFieldType
    });
  };

  // 취소 버튼 클릭
  const handleClose = () => {
    onClose();
  };

  // 등록자 관련 필드인지 확인
  const isUserField = (fieldName) => {
    return fieldName === 'createUser' || fieldName === 'createUserName';
  };

  // 등록자 관련 필드의 표시 여부 결정
  const shouldShowUserField = (fieldName) => {
    if (fieldName === 'createUser') {
      return userFieldType === 'id';
    }
    if (fieldName === 'createUserName') {
      return userFieldType === 'name';
    }
    return true;
  };

  // 표시할 필드들 필터링
  const visibleFields = fields.filter(field => 
    !isUserField(field.field) || shouldShowUserField(field.field)
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDarkMode ? theme.palette.grey[900] : theme.palette.background.paper,
          color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* 필드 선택 도구 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                출력 필드 선택
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<SelectAllIcon />}
                  label="전체선택"
                  onClick={handleSelectAll}
                  variant="outlined"
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  icon={<DeselectIcon />}
                  label="전체해제"
                  onClick={handleDeselectAll}
                  variant="outlined"
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>
            </Box>

            {/* 선택된 필드 수 표시 */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              선택된 필드: {selectedFields.length} / {visibleFields.length}
            </Typography>

            {/* 필드 목록 */}
            <Box sx={{ 
              maxHeight: '250px', 
              overflowY: 'auto',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              p: 1
            }}>
              <Stack spacing={0.5}>
                {visibleFields.map((field) => (
                  <FormControlLabel
                    key={field.field}
                    control={
                      <Checkbox
                        checked={selectedFields.includes(field.field)}
                        onChange={() => handleFieldToggle(field.field)}
                        disabled={isUserField(field.field)}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {field.headerName}
                        </Typography>
                        {field.description && (
                          <Typography variant="caption" color="text.secondary">
                            {field.description}
                          </Typography>
                        )}
                        {isUserField(field.field) && (
                          <Typography variant="caption" color="warning.main">
                            * 등록자 필드는 아래에서 설정
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ 
                      alignItems: 'flex-start',
                      opacity: isUserField(field.field) ? 0.6 : 1
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* 등록자 필드 타입 선택 */}
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  등록자 필드 설정
                </Typography>
              </FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                출력 시 등록자 정보를 어떤 형태로 표시할지 선택하세요.
              </Typography>
              <RadioGroup
                value={userFieldType}
                onChange={handleUserFieldTypeChange}
                row
              >
                <FormControlLabel
                  value="id"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        아이디 (ID)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        등록자의 로그인 아이디로 표시
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="name"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        이름 (Name)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        등록자의 실제 이름으로 표시
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={selectedFields.length === 0}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldSelectionModal; 
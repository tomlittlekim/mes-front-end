import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Box,
  Typography,
  IconButton,
  useTheme,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CustomModal = ({
  open,
  onClose,
  title,
  size,   // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  modalType = 'custom',
  fields = [],
  buttons = [],
  values = {},
  onChange,
  onSubmit,
  children
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [touchedFields, setTouchedFields] = useState({});

  // 모달이 닫힐 때 touchedFields 초기화
  useEffect(() => {
    if (!open) {
      setTouchedFields({});
    }
  }, [open]);

  // 필수 입력값 검증
  const validateRequiredFields = () => {
    return fields.every(field => {
      if (!field.required) return true;
      const value = values[field.id];
      return value !== undefined && value !== null && value !== '' && value.toString().trim() !== '';
    });
  };

  // 필드 에러 상태 확인
  const hasError = (field) => {
    if (!field.required || !touchedFields[field.id]) return false;
    const value = values[field.id];
    return value === undefined || value === null || value === '' || value.toString().trim() === '';
  };

  // 저장 버튼 클릭 핸들러
  const handleSubmit = () => {
    // 모든 필수 필드를 touched로 표시
    const newTouchedFields = {};
    fields.forEach(field => {
      if (field.required) {
        newTouchedFields[field.id] = true;
      }
    });
    setTouchedFields(newTouchedFields);

    // validation 통과 시에만 onSubmit 호출
    if (validateRequiredFields()) {
      onSubmit();
    }
  };

  // 취소 버튼 클릭 핸들러
  const handleClose = () => {
    setTouchedFields({});
    onClose();
  };

  // 기본 버튼 설정
  const getDefaultButtons = () => {
    switch (modalType) {
      case 'register':
        return [
          { label: '저장', onClick: handleSubmit, color: 'primary' },
          { label: '취소', onClick: handleClose, color: 'inherit' }
        ];
      case 'edit':
        return [
          { label: '수정', onClick: handleSubmit, color: 'primary' },
          { label: '취소', onClick: handleClose, color: 'inherit' }
        ];
      default:
        return buttons;
    }
  };

  // 필드 렌더링 함수
  const renderField = (field) => {
    const {
      id,
      label,
      type = 'text',
      required = false,
      options = [],
      lock = false,           // 잠금 상태 (disabled와 동일)
      lockOnEdit = false,     // 수정 시에만 잠금
      hide = false,           // 화면에서 숨김
      fullWidth = true,
      size = 'small',
      rows = type === 'textarea' ? 4 : undefined,
      relation,
      ...rest
    } = field;

    // hide가 true면 렌더링하지 않음
    if (hide) return null;

    // 잠금 상태 계산 (lock과 lockOnEdit만 사용)
    const isDisabled = lock || (modalType === 'edit' && lockOnEdit);
    const error = hasError(field);

    // 필드 값 변경 시 touched 상태 업데이트
    const handleChange = async (e) => {
      if (!touchedFields[id]) {
        setTouchedFields(prev => ({ ...prev, [id]: true }));
      }
      
      // 관계성 필드인 경우 비동기 처리
      if (relation) {
        try {
          await onChange(id, e.target.value);
        } catch (error) {
          console.error('관계성 필드 처리 중 오류:', error);
        }
      } else {
        onChange(id, e.target.value);
      }
    };

    // 관계성 필드의 경우 옵션 동적 로딩
    const fieldOptions = field.options || [];

    switch (type) {
      case 'text':
      case 'number':
      case 'email':
      case 'textarea':
        return (
          <TextField
            key={id}
            id={id}
            label={label}
            type={type === 'textarea' ? 'text' : type}
            required={required}
            disabled={isDisabled}
            fullWidth={fullWidth}
            size={size}
            value={values[id] || ''}
            onChange={handleChange}
            multiline={type === 'textarea'}
            rows={rows}
            error={error}
            helperText={error ? `${label}은(는) 필수 입력값입니다.` : ''}
            {...rest}
          />
        );

      case 'select':
        return (
          <FormControl 
            key={id} 
            fullWidth={fullWidth} 
            size={size}
            error={error}
            disabled={isDisabled}
          >
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select
              labelId={`${id}-label`}
              id={id}
              value={values[id] || ''}
              label={label}
              required={required}
              onChange={handleChange}
              {...rest}
            >
              {fieldOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {label}은(는) 필수 입력값입니다.
              </Typography>
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl 
            key={id} 
            component="fieldset"
            error={error}
          >
            <Typography variant="subtitle2">{label}</Typography>
            <RadioGroup
              row
              value={values[id] || ''}
              onChange={handleChange}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size={size} disabled={isDisabled} />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {label}은(는) 필수 입력값입니다.
              </Typography>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={id}
            control={
              <Checkbox
                checked={values[id] || false}
                onChange={(e) => {
                  if (!touchedFields[id]) {
                    setTouchedFields(prev => ({ ...prev, [id]: true }));
                  }
                  onChange(id, e.target.checked);
                }}
                size={size}
                disabled={isDisabled}
                color={error ? 'error' : 'primary'}
              />
            }
            label={label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={size}
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: isDarkMode ? '#1976d2' : '#1976d2',
          color: '#fff',
          mb: 0
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6" 
            component="span"
            sx={{ 
              color: '#fff',
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: '#fff'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent 
        dividers
        sx={{
          bgcolor: isDarkMode ? 'background.paper' : '#fff',
          '& .MuiInputLabel-root': {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
            },
            '&:hover fieldset': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
            },
            '&.Mui-disabled': {
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderStyle: 'dashed'
              },
              '& input, & textarea': {
                cursor: 'not-allowed'
              }
            }
          },
          '& .MuiSelect-root.Mui-disabled': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            cursor: 'not-allowed'
          },
          '& .MuiRadio-root.Mui-disabled': {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          },
          '& .MuiCheckbox-root.Mui-disabled': {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {children}
        <Box sx={{ display: 'grid', gap: 2, p: 1 }}>
          {fields.map(renderField)}
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: isDarkMode ? 'background.paper' : '#fff' }}>
        {getDefaultButtons().map((button, index) => (
          <Button
            key={index}
            onClick={button.onClick}
            color={button.color}
            variant={button.variant || 'contained'}
            disabled={button.disabled}
          >
            {button.label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal; 
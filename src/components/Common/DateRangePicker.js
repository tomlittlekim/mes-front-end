import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Popover,
  Button,
  Stack,
  Paper,
  Typography,
  IconButton,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider, DatePicker, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isValid, isAfter, isBefore, isEqual } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ko from 'date-fns/locale/ko';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

/**
 * 기간 선택을 위한 커스텀 DateRangePicker 컴포넌트
 *
 * @param {Object} props
 * @param {Date|null} props.startDate - 시작 날짜
 * @param {Date|null} props.endDate - 종료 날짜
 * @param {Function} props.onStartDateChange - 시작 날짜 변경 핸들러
 * @param {Function} props.onEndDateChange - 종료 날짜 변경 핸들러
 * @param {Function} props.onRangeChange - 날짜 범위 변경 핸들러 (startDate, endDate)를 인자로 받음
 * @param {string} props.startLabel - 시작 날짜 레이블 (기본값: "시작일")
 * @param {string} props.endLabel - 종료 날짜 레이블 (기본값: "종료일")
 * @param {string} props.label - 필드 레이블 (기본값: "계획기간")
 * @param {boolean} props.disabled - 비활성화 여부
 * @param {string} props.size - TextField 크기 (small, medium)
 * @returns {JSX.Element}
 */
const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
  startLabel = "시작일",
  endLabel = "종료일",
  label = "계획기간",
  disabled = false,
  size = "small"
}) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [hoveredDate, setHoveredDate] = useState(null);

  // 도메인별 스타일 함수
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };

  const getPrimaryColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f39c12' : '#e67e22';
    }
    return isDarkMode ? '#2196f3' : '#1976d2';
  };

  const getRangeColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(243, 156, 18, 0.15)' : 'rgba(230, 126, 34, 0.1)';
    }
    return isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(25, 118, 210, 0.1)';
  };

  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#2d1e0f' : '#ffffff';
    }
    return isDarkMode ? '#102a43' : '#ffffff';
  };

  // DatePicker 팝업이 열려있는지 여부
  const open = Boolean(anchorEl);

  // 날짜가 범위 내에 있는지 확인하는 함수
  const isInRange = (date) => {
    if (!tempStartDate || !date) return false;

    // 종료일이 설정되지 않았지만 호버링 중인 경우
    if (!tempEndDate && hoveredDate) {
      return (
          (isEqual(date, tempStartDate) || isAfter(date, tempStartDate)) &&
          (isEqual(date, hoveredDate) || isBefore(date, hoveredDate))
      );
    }

    // 종료일이 설정된 경우
    if (tempEndDate) {
      return (
          (isEqual(date, tempStartDate) || isAfter(date, tempStartDate)) &&
          (isEqual(date, tempEndDate) || isBefore(date, tempEndDate))
      );
    }

    // 시작일만 선택된 경우
    return isEqual(date, tempStartDate);
  };

  // 날짜 선택 핸들러
  const handleDateClick = (newDate) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // 시작일이 없거나, 이미 범위가 선택된 경우 -> 새로운 범위 시작
      setTempStartDate(newDate);
      setTempEndDate(null);
    } else {
      // 시작일만 선택된 경우
      if (isBefore(newDate, tempStartDate)) {
        // 선택한 날짜가 시작일보다 이전이면 시작일을 새 날짜로 설정
        setTempStartDate(newDate);
      } else {
        // 종료일 설정
        setTempEndDate(newDate);
      }
    }
  };

  // 호버링 핸들러
  const handleDateHover = (newDate) => {
    if (tempStartDate && !tempEndDate) {
      setHoveredDate(newDate);
    }
  };

  // 적용 버튼 클릭 핸들러
  const handleApply = () => {
    if (onRangeChange) onRangeChange(tempStartDate, tempEndDate);
    setAnchorEl(null);
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setAnchorEl(null);
  };

  // 팝업 열기 핸들러
  const handleClick = (event) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  // 팝업 닫기 핸들러
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 기간 초기화 핸들러
  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    // 초기화 후 바로 적용
    if (onRangeChange) onRangeChange(null, null);
    setAnchorEl(null);
  };

  // 미리 정의된 기간 선택 핸들러 (1주일, 1개월, 3개월, 6개월)
  const handlePresetPeriod = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setTempStartDate(start);
    setTempEndDate(end);
  };

  // props 변경 시 내부 상태 업데이트
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  // 날짜 표시 형식
  const formatDate = (date) => {
    if (!date || !isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // 디스플레이용 텍스트 생성
  const displayText = () => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) return formatDate(startDate);
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <FormControl fullWidth size={size}>
          <InputLabel
              shrink
              htmlFor="date-range-picker"
              sx={{
                backgroundColor: theme.palette.background.paper,
                px: 0.5,
                '&.Mui-focused': {
                  color: domain === DOMAINS.PEMS ? getPrimaryColor() : undefined
                }
              }}
          >
            {label}
          </InputLabel>
          <TextField
              id="date-range-picker"
              fullWidth
              size={size}
              value={displayText()}
              placeholder="날짜 범위를 선택하세요"
              onClick={handleClick}
              disabled={disabled}
              InputProps={{
                readOnly: true,
                endAdornment: (
                    <IconButton
                        edge="end"
                        size="small"
                        disabled={disabled}
                        onClick={handleClick}
                    >
                      <CalendarMonthIcon fontSize="small" />
                    </IconButton>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  cursor: 'pointer'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  // 라벨이 있는 경우 상단 여백 추가
                  borderRadius: 1
                }
              }}
          />

          {/* 날짜 선택 팝업 */}
          <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              PaperProps={{
                sx: {
                  p: 2,
                  width: 'auto',
                  maxWidth: 'calc(100vw - 32px)',
                  bgcolor: getBgColor(),
                  color: getTextColor()
                }
              }}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}>
              {/* 헤더 */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: getTextColor() }}>
                  날짜 범위 선택
                </Typography>
                <IconButton size="small" onClick={handleClose} sx={{ color: getTextColor() }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* 미리 정의된 기간 버튼 */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handlePresetPeriod(7)}
                    sx={{
                      minWidth: 'auto',
                      borderRadius: 1,
                      borderColor: getPrimaryColor(),
                      color: getPrimaryColor()
                    }}
                >
                  1주일
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handlePresetPeriod(30)}
                    sx={{
                      minWidth: 'auto',
                      borderRadius: 1,
                      borderColor: getPrimaryColor(),
                      color: getPrimaryColor()
                    }}
                >
                  1개월
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handlePresetPeriod(90)}
                    sx={{
                      minWidth: 'auto',
                      borderRadius: 1,
                      borderColor: getPrimaryColor(),
                      color: getPrimaryColor()
                    }}
                >
                  3개월
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handlePresetPeriod(180)}
                    sx={{
                      minWidth: 'auto',
                      borderRadius: 1,
                      borderColor: getPrimaryColor(),
                      color: getPrimaryColor()
                    }}
                >
                  6개월
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={handleClear}
                    sx={{ minWidth: 'auto', borderRadius: 1, ml: 'auto' }}
                >
                  초기화
                </Button>
              </Box>

              {/* 선택된 날짜 정보 표시 */}
              <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    bgcolor: theme.palette.action.hover
                  }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {startLabel}
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {formatDate(tempStartDate) || '미선택'}
                  </Typography>
                </Box>
                <Box sx={{ mx: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ color: getTextColor() }}>~</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {endLabel}
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {formatDate(tempEndDate) || '미선택'}
                  </Typography>
                </Box>
              </Paper>

              {/* 달력 */}
              <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={tempEndDate || tempStartDate}
                  onChange={handleDateClick}
                  renderDay={(day, _value, DayProps) => {
                    const isSelected =
                        (tempStartDate && isEqual(day, tempStartDate)) ||
                        (tempEndDate && isEqual(day, tempEndDate));

                    const isInRangeDate = isInRange(day);

                    return (
                        <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                              height: '100%',
                              ...(isInRangeDate && {
                                bgcolor: getRangeColor(),
                                borderRadius: 0
                              }),
                              ...(isSelected && {
                                bgcolor: getPrimaryColor(),
                                color: 'white',
                                borderRadius: '50%'
                              }),
                              ...(isEqual(day, tempStartDate) && {
                                borderTopLeftRadius: '50%',
                                borderBottomLeftRadius: '50%'
                              }),
                              ...(isEqual(day, tempEndDate || hoveredDate) && {
                                borderTopRightRadius: '50%',
                                borderBottomRightRadius: '50%'
                              })
                            }}
                            onMouseEnter={() => handleDateHover(day)}
                        >
                          <DayProps.Day {...DayProps} />
                        </Box>
                    );
                  }}
                  slotProps={{
                    actionBar: { actions: [] },
                    day: {
                      sx: {
                        color: getTextColor(),
                        '&.Mui-selected': {
                          color: 'white',
                          bgcolor: getPrimaryColor(),
                          '&:hover': {
                            bgcolor: getPrimaryColor()
                          }
                        }
                      }
                    },
                    toolbar: {
                      sx: {
                        color: getTextColor()
                      }
                    },
                    layout: {
                      sx: {
                        '.MuiDialogActions-root': {
                          display: 'none'
                        },
                        '.MuiPickersLayout-contentWrapper': {
                          bgcolor: getBgColor()
                        }
                      }
                    }
                  }}
              />

              {/* 하단 버튼 */}
              <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button
                    onClick={handleCancel}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: domain === DOMAINS.PEMS ? getPrimaryColor() : undefined,
                      color: domain === DOMAINS.PEMS ? getPrimaryColor() : undefined
                    }}
                >
                  취소
                </Button>
                <Button
                    onClick={handleApply}
                    size="small"
                    variant="contained"
                    disabled={!tempStartDate}
                    sx={{
                      bgcolor: domain === DOMAINS.PEMS ? getPrimaryColor() : undefined,
                      '&:hover': {
                        bgcolor: domain === DOMAINS.PEMS ?
                            (isDarkMode ? '#f5b041' : '#d35400') :
                            undefined,
                      }
                    }}
                >
                  적용
                </Button>
              </Stack>
            </Box>
          </Popover>
        </FormControl>
      </LocalizationProvider>
  );
};

export default DateRangePicker;
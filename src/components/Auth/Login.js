import React, { useState, useEffect } from 'react';
import './Login.css';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  useTheme,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress, Tooltip
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock, SyncAlt, Phone, AccountCircle } from '@mui/icons-material';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import Swal from 'sweetalert2';
import {signIn, resetPasswordByUserInfo} from "../../api/userApi";
import useLocalStorageVO from "../../components/Common/UseLocalStorageVO"
import {useLocation} from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [req, setReq] = useState({
    userId: "",
    userPwd: "",
  })
  const location = useLocation();

  const theme = useTheme();
  const { domain, domainName, toggleDomain, canToggleDomain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { setUserInfo } = useLocalStorageVO();

  // 비밀번호 초기화 관련 상태
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetData, setResetData] = useState({
    name: '',
    phoneNumber: ''
  });


  const handleChange = (e) => {
    let { name, value } = e.target;
    setReq({...req, [name]: value});
  }

  // 비밀번호 초기화 핸들러들
  const handleResetDataChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenResetDialog = () => {
    setIsResetDialogOpen(true);
    setResetData({ name: '', phoneNumber: '' });
  };

  const handleCloseResetDialog = () => {
    setIsResetDialogOpen(false);
  };

  const handlePasswordReset = async () => {
    if (!resetData.name.trim() || !resetData.phoneNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '이름과 휴대폰번호를 모두 입력해주세요.',
      });
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetPasswordByUserInfo({
        name: resetData.name.trim(),
        phoneNumber: resetData.phoneNumber.replace(/-/g, '')
      });

      if (result === true) {
        handleCloseResetDialog();
        Swal.fire({
          icon: 'success',
          title: '비밀번호 초기화 완료',
          text: '비밀번호가 0000으로 초기화되었습니다.',
        });
      } else {
        throw new Error('일치하는 사용자 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '초기화 실패',
        text: error.message || '서버 오류가 발생했습니다.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  // 컴포넌트 마운트 시 localStorage에서 저장된 아이디 불러오기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('expired') === 'true') {
      Swal.fire({
        icon: 'warning',
        title: '세션 만료',
        text: '인증이 만료되었습니다. 다시 로그인해 주세요.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: isDarkMode ? '#333' : '#fff',
        customClass: {
          timerProgressBar: 'swal-timer-progress-bar'
        }
      });
    }

    const isAuth = localStorage.getItem('isAuthenticated');
    if (isAuth === 'true') window.location.href = '/'

    const savedUserId = localStorage.getItem('savedUserId');
    if (savedUserId) {
      setReq({
        ...req,
        userId: savedUserId,
      })
      setRememberMe(true);
    }
  }, []);

  // 도메인별 색상 설정
  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#1976d2' : '#0a2351';
  };

  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(10, 35, 81, 0.5)' : 'rgba(232, 240, 253, 0.6)';
  };

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#0d2b5e' : '#dae5f5';
  };

  // 아이디 저장 체크박스 상태 변경 핸들러
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!req.userId.trim() || !req.userPwd.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '아이디와 비밀번호를 모두 입력해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    if (rememberMe) {
      localStorage.setItem('savedUserId', req.userId);
    } else {
      localStorage.removeItem('savedUserId');
    }

    try {
      const res = await signIn(req);

      if (res.status === 200) { // 명시적 상태 코드 확인
        setUserInfo(res);

        // 성공 메시지를 보여주고 자동으로 다음 화면으로 이동
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '로그인 성공',
          timer: 1000,
          showConfirmButton: false
        });

        // 타이머와 동시에 리다이렉트 처리
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        Swal.fire('로그인 실패', res.message, 'error');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '에러 발생',
        text: error.response?.message || '알 수 없는 오류',
        confirmButtonText: '확인'
      });
    }
  };

  return (
      <Box className="login-container" sx={{
        backgroundImage: domain === DOMAINS.PEMS
            ? 'linear-gradient(45deg, #d35400, #e67e22)'
            : 'linear-gradient(45deg, #0a2351, #1976d2)',
      }}>
        <Paper elevation={3} className="login-card">
          {/* 개발환경에서만 도메인 전환 버튼 표시 */}
          {canToggleDomain && (
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 2
              }}>
                <Chip
                    icon={<SyncAlt fontSize="small" />}
                    label={`${domain === DOMAINS.IMOS ? 'PEMS' : 'iMOS'}로 전환`}
                    onClick={toggleDomain}
                    sx={{
                      backgroundColor: getBgColor(),
                      borderColor: getBorderColor(),
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                      },
                      color: getAccentColor(),
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                    }}
                    variant="outlined"
                    clickable
                />
              </Box>
          )}

          <Box className="login-header" sx={{ borderBottom: `1px solid ${getBorderColor()}` }}>
            <Typography variant="h4" component="h1" className="system-name"
                        sx={{ color: getAccentColor(), fontWeight: 'bold' }}>
              {domainName}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {domain === DOMAINS.PEMS ? '생산설비 관리 시스템' : '스마트 제조 관리 시스템'}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} className="login-form">
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
              로그인
            </Typography>

            <TextField
                margin="normal"
                required
                fullWidth
                id="userId"
                label="아이디"
                name="userId"
                autoComplete="userId"
                autoFocus={!req.userId} // 저장된 아이디가 없을 때만 자동 포커스
                value={req.userId}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                  ),
                }}
            />
            <Typography variant="caption" color="error" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <span style={{ color: "red", marginRight: 2 }}>*</span>
              아이디는 휴대폰번호입니다
            </Typography>

            <TextField
                margin="normal"
                required
                fullWidth
                name="userPwd"
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                id="userPwd"
                autoComplete="current-password"
                autoFocus={!!req.userId} // 저장된 아이디가 있을 때 비밀번호에 포커스
                value={req.userPwd}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                  ),
                  endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                  )
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                  control={
                    <Checkbox
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        sx={{
                          color: getAccentColor(),
                          '&.Mui-checked': {
                            color: getAccentColor(),
                          },
                        }}
                    />
                  }
                  label="아이디 저장"
              />

              <Tooltip title="비밀번호를 0000으로 초기화합니다">
              <Button 
                variant="text" 
                size="small" 
                sx={{ color: getAccentColor() }}
                onClick={handleOpenResetDialog}
              >
                비밀번호 초기화
              </Button>
              </Tooltip>
            </Box>

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: getAccentColor(),
                  '&:hover': {
                    backgroundColor: domain === DOMAINS.PEMS
                        ? (isDarkMode ? '#d35400' : '#c44d00')
                        : (isDarkMode ? '#0d47a1' : '#051d47'),
                  }
                }}
            >
              로그인
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                또는
              </Typography>
            </Divider>

            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Button variant="outlined" sx={{
                borderColor: getBorderColor(),
                color: 'text.primary'
              }}>
                회원가입 요청
              </Button>
            </Box>
          </Box>

          <Box sx={{
            mt: 3,
            p: 2,
            bgcolor: getBgColor(),
            borderRadius: 1,
            border: `1px solid ${getBorderColor()}`
          }}>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              © 2025 {domainName} 시스템. All rights reserved.
            </Typography>
          </Box>
        </Paper>

        {/* 비밀번호 초기화 팝업 */}
        <Dialog open={isResetDialogOpen} onClose={handleCloseResetDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', color: getAccentColor() }}>
            비밀번호 초기화
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
              이름과 휴대폰번호를 입력해주세요.
            </Typography>
            <TextField
              fullWidth
              label="이름"
              name="name"
              value={resetData.name}
              onChange={handleResetDataChange}
              disabled={isResetting}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start"><AccountCircle /></InputAdornment>
              }}
            />
            <TextField
              fullWidth
              label="휴대폰번호"
              name="phoneNumber"
              placeholder="010-1234-5678"
              value={resetData.phoneNumber}
              onChange={handleResetDataChange}
              disabled={isResetting}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseResetDialog} disabled={isResetting}>취소</Button>
            <Button 
              onClick={handlePasswordReset}
              variant="contained"
              disabled={isResetting}
              sx={{ backgroundColor: getAccentColor() }}
            >
              {isResetting ? <CircularProgress size={20} /> : '초기화'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default Login;
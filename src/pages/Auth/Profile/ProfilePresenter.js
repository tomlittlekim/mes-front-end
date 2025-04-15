import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  IconButton,
  Divider,
  InputAdornment,
  Badge,
  CircularProgress,
  Popover
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { ChromePicker } from 'react-color';
import PageLayout from "../../../components/Layout/PageLayout";

const ProfilePresenter = ({
  profile,
  loading,
  error,
  isEditing,
  upsertLoading,
  resetLoading,
  getTextColor,
  getBgColor,
  getBorderColor,
  theme,
  handleBack,
  handleEdit,
  handleSave,
  handlePasswordChange,
  handleAvatarChange,
  handleInputChange,
  refetch
}) => {
  const [colorAnchorEl, setColorAnchorEl] = useState(null);
  const [selectedColor, setSelectedColor] = useState(profile.imagePath || '#1976d2');

  useEffect(() => {
    setSelectedColor(profile.imagePath || '#1976d2');
  }, [profile.imagePath]);

  const handleColorClick = (event) => {
    setColorAnchorEl(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorAnchorEl(null);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    handleAvatarChange(color.hex);
  };

  // 로딩 상태 표시
  if (loading && !profile.id) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  // 에러 상태 표시
  if (error && !(error.passwordError || (error.message && error.message.toLowerCase().includes('비밀번호')))) {
    return (
      <PageLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            사용자 정보를 가져오는 중 오류가 발생했습니다: {error.message}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => refetch()} 
            sx={{ mt: 2 }}
          >
            다시 시도
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          cursor: 'pointer',
          color: getTextColor(),
          '&:hover': { opacity: 0.8 }
        }} onClick={handleBack}>
          <ArrowBackIcon sx={{ mr: 1 }} />
          <Typography variant="h6">뒤로 가기</Typography>
        </Box>

        <Paper elevation={3} sx={{
          p: 4,
          maxWidth: 1000,
          mx: 'auto',
          bgcolor: getBgColor(),
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6
          }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ color: getTextColor() }}>
              내 프로필
            </Typography>
            {!isEditing ? (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEdit}
                variant="outlined"
                sx={{
                  color: getTextColor(),
                  borderColor: getTextColor(),
                  '&:hover': {
                    borderColor: getTextColor(),
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                수정
              </Button>
            ) : (
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                disabled={upsertLoading}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                {upsertLoading ? '저장 중...' : '저장'}
              </Button>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* 프로필 사진 섹션 */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    isEditing && (
                      <IconButton
                        onClick={handleColorClick}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark
                          }
                        }}
                      >
                        <ColorLensIcon sx={{ color: 'white' }} />
                      </IconButton>
                    )
                  }
                >
                  <Avatar
                    sx={{
                      width: 200,
                      height: 200,
                      bgcolor: selectedColor,
                      fontSize: '4rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {profile.userName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Badge>
                <Popover
                  open={Boolean(colorAnchorEl)}
                  anchorEl={colorAnchorEl}
                  onClose={handleColorClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <ChromePicker
                    color={selectedColor}
                    onChange={handleColorChange}
                  />
                </Popover>
                <Typography
                  variant="h5"
                  sx={{
                    mt: 2,
                    color: getTextColor(),
                    fontWeight: 'bold'
                  }}
                >
                  {profile.userName}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: getTextColor(),
                    opacity: 0.8
                  }}
                >
                  {profile.departmentName} · {profile.positionName}
                </Typography>
              </Box>
            </Grid>

            {/* 개인정보 섹션 */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* 기본 정보 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: getTextColor(), mb: 2 }}>
                    기본 정보
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="아이디"
                    value={profile.loginId}
                    onChange={handleInputChange('loginId')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이름"
                    value={profile.userName}
                    onChange={handleInputChange('userName')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이메일"
                    value={profile.userEmail}
                    onChange={handleInputChange('userEmail')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handlePasswordChange}
                    startIcon={<LockIcon />}
                    disabled={resetLoading}
                    sx={{
                      height: '56px',
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    {resetLoading ? '처리 중...' : '비밀번호 변경'}
                  </Button>
                </Grid>

                {/* 추가 정보 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: getTextColor(), mb: 2, mt: 2 }}>
                    추가 정보
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="회사"
                    value={profile.compCd || '-'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="권한"
                    value={profile.authorityName || '-'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="휴대전화"
                    value={profile.phoneNum || ''}
                    onChange={handleInputChange('phoneNum')}
                    disabled={!isEditing}
                    inputProps={{ maxLength: 11 }}
                    Input={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* 수정 가능한 항목 안내 */}
          {isEditing && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="red">
                * 수정 가능한 항목: <b>아이디, 이름, 이메일, 휴대전화</b>
                  <br />
                  ** 비밀번호를 분실한 경우 관리자에게 문의하세요.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default ProfilePresenter; 
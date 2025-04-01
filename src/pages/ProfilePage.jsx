// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    useTheme,
    Stack,
    Tooltip,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Badge
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import { useDomain, DOMAINS } from '../contexts/DomainContext';
import PageLayout from '../components/Layout/PageLayout';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';

const ProfilePage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { domain } = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        userId: 'hong.gd',
        name: localStorage.getItem('username') || '홍길동',
        nickname: '길동이',
        email: 'hong.gd@megazone.com',
        department: '개발팀',
        position: '사원',
        company: '메가존',
        phone: '010-1234-5678',
        address: '서울특별시 강남구 논현로 85길 46',
        birthday: new Date('1990-01-01'),
        bio: '안녕하세요. 개발팀 홍길동입니다.',
        avatar: null
    });

    // 수정 가능한 필드 목록
    const editableFields = ['nickname', 'phone', 'address', 'bio'];

    const getTextColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
        }
        return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
    };

    const getBgColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
        }
        return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        Swal.fire({
            icon: 'success',
            title: '성공',
            text: '프로필이 저장되었습니다.',
            confirmButtonText: '확인'
        });
    };

    const handlePasswordChange = () => {
        Swal.fire({
            title: '비밀번호 변경',
            html: `
                <input type="password" id="currentPassword" class="swal2-input" placeholder="현재 비밀번호">
                <input type="password" id="newPassword" class="swal2-input" placeholder="새 비밀번호">
                <input type="password" id="confirmPassword" class="swal2-input" placeholder="새 비밀번호 확인">
            `,
            showCancelButton: true,
            confirmButtonText: '변경',
            cancelButtonText: '취소',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                // 비밀번호 변경 로직 구현
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: '비밀번호가 변경되었습니다.',
                    confirmButtonText: '확인'
                });
            }
        });
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({
                    ...prev,
                    avatar: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field) => (event) => {
        setProfile(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

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
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.dark
                                    }
                                }}
                            >
                                저장
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
                                                component="label"
                                                sx={{
                                                    bgcolor: theme.palette.primary.main,
                                                    '&:hover': {
                                                        bgcolor: theme.palette.primary.dark
                                                    }
                                                }}
                                            >
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={handleAvatarChange}
                                                />
                                                <PhotoCamera sx={{ color: 'white' }} />
                                            </IconButton>
                                        )
                                    }
                                >
                                    <Avatar
                                        src={profile.avatar}
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            border: `4px solid ${getTextColor()}`,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    />
                                </Badge>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mt: 2,
                                        color: getTextColor(),
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {profile.name}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: getTextColor(),
                                        opacity: 0.8
                                    }}
                                >
                                    {profile.department} · {profile.position}
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
                                        value={profile.userId}
                                        disabled
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
                                        label="닉네임"
                                        value={profile.nickname}
                                        onChange={handleInputChange('nickname')}
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
                                        value={profile.email}
                                        disabled
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
                                        비밀번호 변경
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
                                        value={profile.company}
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
                                        value={profile.phone}
                                        onChange={handleInputChange('phone')}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="주소"
                                        value={profile.address}
                                        onChange={handleInputChange('address')}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <HomeIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                                        <DatePicker
                                            label="생년월일"
                                            value={profile.birthday}
                                            disabled
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <CakeIcon />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="자기소개"
                                        value={profile.bio}
                                        onChange={handleInputChange('bio')}
                                        disabled={!isEditing}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* 수정 가능한 항목 안내 */}
                    {isEditing && (
                        <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                * 수정 가능한 항목: 닉네임, 휴대전화, 주소, 자기소개
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </PageLayout>
    );
};

export default ProfilePage;
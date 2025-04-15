import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material';
import { useDomain, DOMAINS } from '../../../contexts/DomainContext';
import Swal from 'sweetalert2';
import { gql } from '@apollo/client';
import {
  USER_DETAIL_MUTATION,
  USER_DETAIL_QUERY, USER_PWD_CHANGE_MUTATION
} from "../../../graphql-queries/auth/myProfile";
import ProfilePresenter from "../../../pages/Auth/Profile/ProfilePresenter";
import { useGraphQL } from "../../../apollo/useGraphQL";
import useLocalStorageVO from "../../Common/UseLocalStorageVO";
import Message from "../../../utils/message/Message";

// GraphQL 쿼리 및 뮤테이션 정의
const USER_DETAIL_GET = gql`${USER_DETAIL_QUERY}`
const USER_DETAIL_SAVE = gql`${USER_DETAIL_MUTATION}`
const USER_PWD_CHANGE = gql`${USER_PWD_CHANGE_MUTATION}`

const ProfileContainer = () => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery, executeMutation, loading: gqlLoading, error: gqlError } = useGraphQL();
  const { loginUser, logout } = useLocalStorageVO();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [profile, setProfile] = useState({
    id: loginUser.id,
    site: '',
    compCd: '',
    userName: loginUser.userNm || '유저 이름이 없습니다',
    loginId: loginUser.loginId || '',
    imagePath: loginUser.imagePath || '#1976d2',
    roleId: 0,
    roleName: '',
    userEmail: '',
    phoneNum: '',
    departmentId: '',
    departmentName: '',
    positionId: '',
    positionName: '',
    authorityName: '',
    flagActive: true,
  });

  // 로그인 ID 가져오기
  const loginId = loginUser.loginId;

  // 사용자 정보 로드 함수
  const fetchUserDetail = async () => {
    if (!loginId) {
      console.log('로그인 ID가 없습니다. 사용자 정보를 가져올 수 없습니다.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const result = await executeQuery(USER_DETAIL_GET, { id: profile.id });
      
      if (result.data && result.data.getUserDetail) {
        const userDetail = result.data.getUserDetail;
        setProfile(prev => ({
          ...prev,
          id: userDetail.id,
          site: userDetail.site || '',
          compCd: userDetail.compCd || '',
          userName: userDetail.userName || '',
          loginId: userDetail.loginId || '',
          imagePath: userDetail.imagePath || '',
          roleName: userDetail.roleName || '',
          userEmail: userDetail.userEmail || '',
          phoneNum: userDetail.phoneNum || '',
          departmentName: userDetail.departmentName || '',
          positionName: userDetail.positionName || '',
          authorityName: userDetail.authorityName || '',
          flagActive: userDetail.flagActive
        }));
      } else {
        console.error('사용자 정보가 없거나 형식이 올바르지 않습니다:', result);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /** 초기 데이터 로드 */
  useEffect(() => {
    const loadData = async () => {
      await fetchUserDetail();
    };
    loadData();
  }, []);

  // 스타일 관련 함수
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

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setUpsertLoading(true);
      
      const userInput = {
        id: profile.id,
        site: profile.site,
        compCd: profile.compCd,
        userName: profile.userName,
        loginId: profile.loginId,
        roleId: profile.roleId || 0,
        userEmail: profile.userEmail,
        phoneNum: profile.phoneNum,
        departmentId: profile.departmentId,
        positionId: profile.positionId,
        flagActive: profile.flagActive,
        imagePath: profile.imagePath,
      };

      const response = await executeMutation(USER_DETAIL_SAVE, { req: userInput });

      if (response) {
        setIsEditing(false);
        Message.showSuccess('프로필이 수정되었습니다. 다시 로그인 해주세요.', logout)
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '프로필 저장 중 오류가 발생했습니다: ' + error.message,
        confirmButtonText: '확인'
      });
    } finally {
      setUpsertLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!profile.id) {
      Message.showError(Message.ERROR_NO_USERINFO)
      return;
    }

    // Swal에 사용할 커스텀 HTML과 스타일 정의
    const customHtml = `
      <style>
        .pwd-input-container {
          margin-bottom: 15px;
          text-align: left;
        }
        .pwd-input-container input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
        }
        .pwd-input-container label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          font-size: 14px;
          text-align: left;
        }
        .pwd-input-error {
          border-color: #ff4d4f !important;
          background-color: #fff2f0 !important;
        }
        .error-message {
          color: #ff4d4f;
          font-size: 12px;
          margin-top: 5px;
          display: none;
        }
        .error-show {
          display: block;
        }
      </style>
      <div class="pwd-input-container">
        <label for="currentPassword">현재 비밀번호</label>
        <input type="password" id="currentPassword" placeholder="현재 비밀번호">
        <div id="currentPwdError" class="error-message">현재 비밀번호를 입력해주세요</div>
      </div>
      <div class="pwd-input-container">
        <label for="newPassword">새 비밀번호</label>
        <input type="password" id="newPassword" placeholder="새 비밀번호">
        <div id="newPwdError" class="error-message">새 비밀번호를 입력해주세요</div>
      </div>
      <div class="pwd-input-container">
        <label for="confirmPassword">새 비밀번호 확인</label>
        <input type="password" id="confirmPassword" placeholder="새 비밀번호 확인">
        <div id="confirmPwdError" class="error-message">비밀번호가 일치하지 않습니다</div>
      </div>
    `;

    // 기존 오류 상태를 보존하고 비밀번호 변경 작업 동안 일시적으로 null로 설정
    const prevError = error;
    setError(null);

    try {
      const swalResult = await Swal.fire({
        title: '비밀번호 변경',
        html: customHtml,
        showCancelButton: true,
        confirmButtonText: '변경',
        cancelButtonText: '취소',
        showLoaderOnConfirm: true,
        didOpen: () => {
          // 입력 필드 요소 가져오기
          const currentPasswordInput = document.getElementById('currentPassword');
          const newPasswordInput = document.getElementById('newPassword');
          const confirmPasswordInput = document.getElementById('confirmPassword');
          const confirmPwdError = document.getElementById('confirmPwdError');
          const newPwdError = document.getElementById('newPwdError');
          const currentPwdError = document.getElementById('currentPwdError');
          
          // 확인 버튼 비활성화
          Swal.getConfirmButton().disabled = true;
          
          // 입력 이벤트 리스너 - 모든 유효성 검사
          const validateInputs = () => {
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // 현재 비밀번호 유효성 검사
            if (!currentPassword) {
              currentPasswordInput.classList.add('pwd-input-error');
              currentPwdError.classList.add('error-show');
            } else {
              currentPasswordInput.classList.remove('pwd-input-error');
              currentPwdError.classList.remove('error-show');
            }
            
            // 새 비밀번호 유효성 검사
            if (!newPassword) {
              newPasswordInput.classList.add('pwd-input-error');
              newPwdError.classList.add('error-show');
            } else {
              newPasswordInput.classList.remove('pwd-input-error');
              newPwdError.classList.remove('error-show');
            }
            
            // 비밀번호 확인 일치 검사
            if (newPassword && (newPassword !== confirmPassword)) {
              confirmPasswordInput.classList.add('pwd-input-error');
              confirmPwdError.classList.add('error-show');
            } else {
              confirmPasswordInput.classList.remove('pwd-input-error');
              confirmPwdError.classList.remove('error-show');
            }
            
            // 모든 조건이 만족하면 확인 버튼 활성화
            Swal.getConfirmButton().disabled = !(
              currentPassword && 
              newPassword && 
              confirmPassword && 
              newPassword === confirmPassword
            );
          };
          
          // 입력 이벤트에 대한 리스너 등록
          currentPasswordInput.addEventListener('input', validateInputs);
          newPasswordInput.addEventListener('input', validateInputs);
          confirmPasswordInput.addEventListener('input', validateInputs);
        },
        preConfirm: async () => {
          const currentPassword = document.getElementById('currentPassword').value;
          const newPassword = document.getElementById('newPassword').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          
          // 유효성 검사 (이중 확인)
          if (!currentPassword || !newPassword || !confirmPassword) {
            Swal.showValidationMessage('모든 필드를 입력해주세요');
            return false;
          }
          
          if (newPassword !== confirmPassword) {
            Swal.showValidationMessage('새 비밀번호가 일치하지 않습니다');
            return false;
          }
          
          try {
            setResetLoading(true);
            // 비밀번호 변경 쿼리 실행 - 파라미터 맞춤
            const result = await executeMutation(USER_PWD_CHANGE, { 
              id: profile.id,
              currentPassword,
              newPassword
            });
            setResetLoading(false);
            return result;
          } catch (pwdError) {
            setResetLoading(false);
            
            // 오류 메시지 표시는 여기서만 처리하고 컴포넌트 상태에는 반영하지 않음
            console.error('비밀번호 변경 오류:', pwdError);
            
            // 오류 종류에 따른 메시지 커스터마이징
            let errorMessage = pwdError.message || '알 수 없는 오류가 발생했습니다';
            
            // 서버에서 반환된 특정 오류 메시지에 따른 처리
            if (errorMessage.includes('현재 비밀번호가 일치하지 않습니다')) {
              // 현재 비밀번호 불일치 오류 - 현재 비밀번호 입력란 강조
              document.getElementById('currentPassword').classList.add('pwd-input-error');
              document.getElementById('currentPwdError').textContent = '현재 비밀번호가 일치하지 않습니다';
              document.getElementById('currentPwdError').classList.add('error-show');
              errorMessage = '현재 비밀번호가 일치하지 않습니다';
            } else if (errorMessage.includes('비밀번호 정책')) {
              // 비밀번호 정책 오류 - 새 비밀번호 입력란 강조
              document.getElementById('newPassword').classList.add('pwd-input-error');
              document.getElementById('newPwdError').textContent = errorMessage;
              document.getElementById('newPwdError').classList.add('error-show');
            }
            
            // 오류 객체에 타입 정보 추가 (비밀번호 관련 오류로 표시)
            pwdError.passwordError = true;
            
            Swal.showValidationMessage(errorMessage);
            return false;
          }
        }
      });

      if (swalResult.isConfirmed) {
        Message.showSuccess('비밀번호가 변경되었습니다.')
      }
    } catch (dialogError) {
      console.error('비밀번호 변경 다이얼로그 오류:', dialogError);
      Message.showError('비밀번호 변경 처리 중 오류가 발생했습니다.')
    } finally {
      // 원래 오류 상태 복원 (프로필 관련 오류가 있었다면)
      setError(prevError);
    }
  };

  const handleAvatarChange = (color) => {
    setProfile(prev => ({
      ...prev,
      imagePath: color
    }));
  };

  const handleInputChange = (field) => (event) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <ProfilePresenter
      profile={profile}
      loading={loading || gqlLoading}
      error={error || gqlError}
      isEditing={isEditing}
      upsertLoading={upsertLoading}
      resetLoading={resetLoading}
      getTextColor={getTextColor}
      getBgColor={getBgColor}
      getBorderColor={getBorderColor}
      theme={theme}
      handleBack={handleBack}
      handleEdit={handleEdit}
      handleSave={handleSave}
      handlePasswordChange={handlePasswordChange}
      handleAvatarChange={handleAvatarChange}
      handleInputChange={handleInputChange}
      refetch={fetchUserDetail}
    />
  );
};

export default ProfileContainer; 
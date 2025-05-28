export const USER_DETAIL_QUERY = `
query getUserDetail($loginId: String!) {
    getUserDetail(loginId: $loginId) {
        id
        site
        compCd
        userName
        loginId
        userPwd
        imagePath
        roleId
        userEmail
        phoneNum
        departmentId
        departmentName
        positionId
        positionName
        authorityName
        flagActive
    }
}
`;

export const USER_DETAIL_MUTATION = `
  mutation updateMyInfo($req: UserInput!) {
    updateMyInfo(req: $req)
  }
`

export const USER_PWD_CHANGE_MUTATION = `
  mutation changePwd($loginId: String!, $currentPassword: String!, $newPassword: String!) {
    changePwd(loginId: $loginId, currentPassword: $currentPassword, newPassword: $newPassword)
  }
`
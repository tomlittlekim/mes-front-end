export const USER_DETAIL_QUERY = `
query getUserDetail($id: Int!) {
    getUserDetail(id: $id) {
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
  mutation changePwd($id: Int!, $currentPassword: String!, $newPassword: String!) {
    changePwd(id: $id, currentPassword: $currentPassword, newPassword: $newPassword)
  }
`
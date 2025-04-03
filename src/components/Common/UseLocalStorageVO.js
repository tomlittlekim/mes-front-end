import {useEffect, useState} from "react";

function  useLocalStorageVO() {
    const [loginUser, setLoginUser] = useState(() => {
        const stored = localStorage.getItem("auth");
        return stored ? JSON.parse(stored) : {
            id: -1,
            loginId: '',
            userNm: '',
            userEmail: '',
            userRole: -1,
            roleNm: ''
        };
    });

    useEffect(() => {
        localStorage.setItem('auth', JSON.stringify(loginUser));
        if (loginUser.id >= 0) {
            localStorage.setItem('isAuthenticated', 'true');
        } else localStorage.removeItem('isAuthenticated');
    }, [loginUser]);

    const setUserInfo = (auth) => {
        setLoginUser({
            id: auth.id,
            loginId: auth.loginId,
            userNm: auth.userNm,
            userEmail: auth.email,
            userRole: auth.roleId,
            roleNm: auth.roleNm,
        })
    }

    const logout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('isAuthenticated');
    }

    return { setUserInfo, logout, loginUser };
}

export default useLocalStorageVO;
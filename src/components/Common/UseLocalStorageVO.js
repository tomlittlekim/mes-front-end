import {useEffect, useState} from "react";

function  useLocalStorageVO() {
    const [loginUser, setLoginUser] = useState(() => {
        const stored = localStorage.getItem("auth");
        return stored ? JSON.parse(stored) : {
            id: -1,
            userId: '',
            userNm: '',
            userEmail: '',
            userRole: ''
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
            userId: auth.userId,
            userNm: auth.userNm,
            userEmail: auth.email,
            userRole: auth.roleId,
        })
    }

    const logout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('isAuthenticated');
    }

    return { setUserInfo, logout, loginUser };
}

export default useLocalStorageVO;
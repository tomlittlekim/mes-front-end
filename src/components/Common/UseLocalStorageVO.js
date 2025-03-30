import {useEffect, useState} from "react";

function  useLocalStorageVO() {
    const [loginUser, setLoginUser] = useState(() => {
        const stored = localStorage.getItem("auth");
        return stored ? JSON.parse(stored) : {
            userId: '',
            userNm: '',
            userEmail: '',
            userRole: ''
        };
    });

    useEffect(() => {
        localStorage.setItem('auth', JSON.stringify(loginUser));
        localStorage.setItem('isAuthenticated', 'true');
    }, [loginUser]);

    const setUserInfo = (auth) => {
        setLoginUser({
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
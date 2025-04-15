import {useEffect, useState} from "react";

function useLocalStorageVO() {
    const [loginUser, setLoginUser] = useState(() => {
        const stored = localStorage.getItem("auth");
        return stored ? JSON.parse(stored) : {
            id: null,
            site: null,
            compCd: null,
            loginId: null,
            userNm: null,
            userEmail: null,
            userRole: null,
            roleNm: null,
            priorityLevel: null,
        };
    });

    useEffect(() => {
        localStorage.setItem('auth', JSON.stringify(loginUser));
        if (loginUser.id !== null) {
            localStorage.setItem('isAuthenticated', 'true');
        } else localStorage.removeItem('isAuthenticated');
    }, [loginUser]);

    const setUserInfo = (auth) => {
        setLoginUser({
            id: auth.id,
            site: auth.site,
            compCd: auth.compCd,
            loginId: auth.loginId,
            userNm: auth.userNm,
            userEmail: auth.email,
            userRole: auth.roleId,
            roleNm: auth.roleNm,
            priorityLevel: auth.priorityLevel
        })
    }

    const logout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('isAuthenticated');
        setLoginUser({
            id: null,
            site: null,
            compCd: null,
            loginId: null,
            userNm: null,
            userEmail: null,
            userRole: null,
            roleNm: null,
            priorityLevel: null,
        });
        window.location.href = '/';
    }

    return { setUserInfo, logout, loginUser };
}

export default useLocalStorageVO;
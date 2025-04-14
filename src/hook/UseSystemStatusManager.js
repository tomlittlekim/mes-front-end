import {useEffect, useState} from "react";
import useLocalStorageVO from "../components/Common/UseLocalStorageVO";
import {getCompanySelect, getSite} from "../api/utilApi";
import {getRolesForSelect} from "../api/userRoleApi";
import {getUserGroup} from "../api/userApi";
import Swal from "sweetalert2";

function useSystemStatusManager() {
    const { loginUser } = useLocalStorageVO();

    const [userRoleGroup, setUserRoleGroup] = useState([{
        roleId: null,
        roleName: null,
        compCd: null,
        priorityLevel: null
    }]);
    const [userGroup, setUserGroup] = useState([{
        id: null,
        loginId: null,
        userName: null,
        departmentId: null,
        positionId: null,
        roleId: null,
        imagePath: null,
        userEmail: null,
        phoneNum: null,
        flagActive: null
    }]);
    const [siteGroup, setSiteGroup] = useState([{
        codeId: null,
        codeName: null
    }]);
    const [compCdGroup, setCompCdGroup] = useState([{
        compCd: null,
        companyName: null
    }]);
    const [systemStatus, setSystemStatus] = useState({
        icon: null,
        text: null
    })

    useEffect(() => {
        if (loginUser.id > 0) {
            initialSetting();
            // const interval = setInterval(() => {
            //     initialSetting();
            // }, 10 * 60 * 1000); // 10분마다 호출 (600,000ms)
            //
            // return () => clearInterval(interval);
        }
    }, [loginUser])

    useEffect(() => {
        if (systemStatus.icon !== null) {
            Swal.fire({
                icon: systemStatus.icon,
                title: systemStatus.icon === 'success' ? "성공" : systemStatus.icon === 'loading' ? '' : "오류",
                text: systemStatus.text,
                confirmButtonText: '확인'
            })
        }
    }, [systemStatus]);

    const initialSetting = async () => {
        const compCdData = await getCompanySelect();
        setCompCdGroup(compCdData ?? []);

        const siteData = await getSite();
        setSiteGroup(siteData ?? []);

        const roleData = await getRolesForSelect();
        setUserRoleGroup(roleData.getRolesForSelect ?? []);

        const userData = await getUserGroup();
        setUserGroup(userData ?? []);
    }

    const commonData = async (list: []): [] => {
        return await list.filter(data => data?.compCd === 'default');
    }

    return { userRoleGroup, userGroup, siteGroup, compCdGroup, setSystemStatus, commonData };
}

export default useSystemStatusManager;
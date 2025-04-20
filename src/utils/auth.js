// 토큰 만료 리다이렉트 공통 함수 - apollo, graphFetch 모두 적용
export const handleTokenExpiration = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('isAuthenticated');
    document.cookie = 'access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    window.location.href = '/login?expired=true';
    throw new Error('Token expired'); // 추가 처리 방지
};
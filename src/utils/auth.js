// 토큰 만료 리다이렉트 공통 함수 - apollo, graphFetch 모두 적용
export const handleTokenExpiration = () => {
    localStorage.removeItem('token');
    window.location.href = '/login?expired=true';
    throw new Error('Token expired'); // 추가 처리 방지
};
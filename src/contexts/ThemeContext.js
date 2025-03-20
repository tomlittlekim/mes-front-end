import React, { createContext, useState, useContext, useEffect } from 'react';

// 테마 컨텍스트 생성
const ThemeContext = createContext();

// 테마 제공자 컴포넌트
export const ThemeProvider = ({ children }) => {
  // localStorage에서 테마 설정 불러오기 (기본값은 시스템 설정 기반)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // 시스템 테마 감지
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // 테마 변경 함수
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 테마 전환 시 transition 효과 추가
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
  };

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // localStorage에 설정된 테마가 없을 경우에만 시스템 설정 따름
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    // 이벤트 리스너 등록
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Safari 14 이전 버전 지원
      mediaQuery.addListener(handleChange);
    }
    
    // 정리 함수
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // 테마 변경 시 body에 클래스 추가/제거
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
  );
};

// 테마 컨텍스트 사용을 위한 훅
export const useTheme = () => useContext(ThemeContext);
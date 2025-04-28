import MaterialManagement from './MaterialManagement';
import SearchForm from './components/SearchForm';
import MaterialGrid from './components/MaterialGrid';
import HelpContent from './components/HelpContent';
import PageHeader from './components/PageHeader';
import { useMaterialData } from './hooks/useMaterialData';

// 직접 style 유틸리티 함수들을 임포트
import { 
  getTextColor, 
  getBgColor, 
  getBorderColor,
  getMaterialTypeColor
} from './utils/styleUtils';

// 기본 내보내기
export default MaterialManagement;

// 컴포넌트 내보내기
export {
  SearchForm,
  MaterialGrid,
  HelpContent,
  PageHeader,
  useMaterialData
};

// 스타일 유틸리티 함수 내보내기
export {
  getTextColor,
  getBgColor,
  getBorderColor,
  getMaterialTypeColor
}; 
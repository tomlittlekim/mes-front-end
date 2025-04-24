// 통합된 컴포넌트
export { default } from './InventoryMovementCombined';
export { useInventoryMovement } from './InventoryMovementCombined';

// 기존 코드와의 호환성을 위해 named export도 제공
export { default as InventoryMovement } from './InventoryMovementCombined'; 
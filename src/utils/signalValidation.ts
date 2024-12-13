import { SignalType, PositionType, PriceLevel } from '../types/signal';

export const validateSignalType = (type: string): type is SignalType => {
  return ['Limit', 'Market'].includes(type);
};

export const validatePosition = (position: string): position is PositionType => {
  return ['Long', 'Short', 'Spot'].includes(position);
};

export const validatePriceLevels = (levels: PriceLevel[]): boolean => {
  return levels.every(level => 
    level.id && 
    typeof level.price === 'string' &&
    level.price.trim() !== ''
  );
};

export const validateLeverage = (leverage: string | undefined): boolean => {
  if (!leverage) return true;
  const num = parseFloat(leverage);
  return !isNaN(num) && num > 0;
};
import { 
  PiggyBank, 
  Airplane, 
  House, 
  Car, 
  GraduationCap, 
  Heart, 
  Gift, 
  ShoppingCart, 
  GameController, 
  Rocket,
  Hamburger,
  Confetti
} from '@phosphor-icons/react';

export const iconMap = {
  'piggy-bank': PiggyBank,
  'airplane': Airplane,
  'house': House,
  'car': Car,
  'graduation': GraduationCap,
  'heart': Heart,
  'gift': Gift,
  'shopping': ShoppingCart,
  'game': GameController,
  'rocket': Rocket,
  'food': Hamburger,
  'party': Confetti,
};

export const getIcon = (iconName) => {
  return iconMap[iconName] || PiggyBank;
};

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tamanho base de design (baseado no iPhone 8)
const baseWidth = 375;
const baseHeight = 667;

// Calculando a escala para largura e altura
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// Função para normalizar tamanhos com base na largura da tela
export function normalize(size) {
  // Ajuste específico para iOS para compensar o Dynamic Type
  const platformAdjustment = Platform.OS === 'ios' ? 0.85 : 1;
  
  const newSize = size * widthScale * platformAdjustment;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Função para escala moderada (menos intensa que a escala completa)
export function moderateScale(size, factor = 0.5) {
  const platformAdjustment = Platform.OS === 'ios' ? 0.85 : 1;
  return size + (normalize(size) - size) * factor * platformAdjustment;
}

// Função para escala vertical (baseada na altura da tela)
export function verticalScale(size) {
  const platformAdjustment = Platform.OS === 'ios' ? 0.85 : 1;
  return Math.round(size * heightScale * platformAdjustment);
}

// Constantes de tamanho de fonte para uso em toda a aplicação
export const FontSizes = {
  tiny: normalize(10),
  small: normalize(12),
  regular: normalize(14),
  medium: normalize(16),
  large: normalize(18),
  xlarge: normalize(20),
  xxlarge: normalize(24),
  title: normalize(28),
  header: normalize(32),
};

// Constantes para espaçamentos
export const Spacing = {
  tiny: normalize(4),
  small: normalize(8),
  regular: normalize(12),
  medium: normalize(16),
  large: normalize(20),
  xlarge: normalize(24),
  xxlarge: normalize(32),
};

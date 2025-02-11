export const typography = {
  fonts: {
    dongle: {
      regular: 'Dongle-Regular',
      light: 'Dongle-Light',
      bold: 'Dongle-Bold',
    },
    damion: {
      regular: 'Damion-Regular',
    },
    raleway: {
      regular: 'Raleway-Regular',
      medium: 'Raleway-Medium',
      bold: 'Raleway-Bold',
    },
  },
  // Tamanhos pré-definidos para textos
  sizes: {
    title: 32,
    subtitle: 24,
    button: 16,
    body: 14,
    caption: 12,
  },
};

// Estilos comuns para textos
export const textStyles = {
  title: {
    fontFamily: typography.fonts.dongle.bold,
    fontSize: typography.sizes.title,
  },
  subtitle: {
    fontFamily: typography.fonts.dongle.regular,
    fontSize: typography.sizes.subtitle,
  },
  decorative: {
    fontFamily: typography.fonts.damion.regular,
    fontSize: typography.sizes.subtitle,
  },
  button: {
    fontFamily: typography.fonts.raleway.medium,
    fontSize: typography.sizes.button,
  },
  body: {
    fontFamily: typography.fonts.raleway.regular,
    fontSize: typography.sizes.body,
  },
  bodyBold: {
    fontFamily: typography.fonts.raleway.bold,
    fontSize: typography.sizes.body,
  },
  caption: {
    fontFamily: typography.fonts.raleway.regular,
    fontSize: typography.sizes.caption,
  },
};

// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

/**
 * Metro configuration for Expo projects.
 * See: https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Modify the config to support SVG files
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

module.exports = config;

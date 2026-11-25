const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Reserved for the post-v1 3D mascot assets.
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;

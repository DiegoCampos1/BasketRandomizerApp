const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// The monorepo root has a stray node_modules (react-hook-form, zod) that must
// never leak into this app's bundle. Block it instead of disabling
// hierarchical lookup, which would break packages with nested node_modules
// (e.g. react-native-reanimated ships its own semver copy).
const rootNodeModules = path.resolve(__dirname, "..", "node_modules");
const escaped = rootNodeModules.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
config.resolver.blockList = [new RegExp(`${escaped}/.*`)];

module.exports = withNativeWind(config, { input: "./src/global.css" });

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // (put any other plugins above this line)
      'react-native-reanimated/plugin',
    ],
  };
};

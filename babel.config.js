module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@contexts': './contexts',
            '@hooks': './hooks',
            '@services': './services',
            '@constants': './constants',
            '@localization': './localization',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};

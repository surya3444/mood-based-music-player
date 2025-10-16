module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add a fallback for the 'fs' module.
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
      };

      return webpackConfig;
    },
  },
};
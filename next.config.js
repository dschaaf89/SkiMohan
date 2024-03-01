const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore .js.map files
    config.module.rules.push({
      test: /\.js\.map$/,
      use: 'ignore-loader',
    });

    // Add a rule for .ttf files
    config.module.rules.push({
      test: /\.ttf$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 100000,
          },
        },
      ],
    });

    // Alias for electron to prevent errors
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.electron = false;

    return config; 
  },
}

module.exports = nextConfig;

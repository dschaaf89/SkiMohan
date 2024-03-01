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

    // Add this to alias 'electron' to false, effectively ignoring it
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.electron = false;

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;

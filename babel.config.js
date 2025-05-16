export default {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'auto' // Explicitly set modules to auto for better ESM handling
    }]
  ],
};

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [
    require('@zakodium/tailwind-config')({
      colors: {
        primary: 'gray',
      },
    }),
  ],
};

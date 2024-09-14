module.exports = [
  {
    script: 'dist/main.js',
    name: 'fastdeal.live',
    exec_mode: 'cluster',
    instances: 3,
  },
];

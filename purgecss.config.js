module.exports = {
  content: ['404.html', 'blocks/**/*.js', 'scripts/*.js'], // Files to analyze for used CSS classes
  css: ['node_modules/bootstrap/dist/css/bootstrap.min.css'], // CSS files to include
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  safelist: [
    'carousel',
    'carousel-inner',
    'carousel-dark',
    'carousel-fade',
    'carousel-item-next',
    'carousel-item-start',
    'carousel-item-end',
    'carousel-item-prev',
    'carousel-control-prev',
    'carousel-control-next',
    'carousel-control-start',
    'carousel-control-end',
    'carousel-control-next-icon',
    'carousel-control-prev-icon',
    'pointer-event',
    'justify-content-end',
    'p-5', 'my-5',
  ],
};

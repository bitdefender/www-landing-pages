module.exports = {
  content: ['404.html', '_src-lp/blocks/**/*.js', '_src-lp/scripts/*.js'], // Files to analyze for used CSS classes
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
    'p-5', 'pt-3', 'my-5', 'my-0', 'my-1', 'my-2', 'mx-auto',
    'table-bordered',
  ],
  blocklist: ['strong'],
};

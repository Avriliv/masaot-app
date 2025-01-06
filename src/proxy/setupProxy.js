const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for OpenStreetMap routing
  app.use(
    '/routing',
    createProxyMiddleware({
      target: 'https://routing.openstreetmap.de',
      changeOrigin: true,
      pathRewrite: {
        '^/routing': '',
      },
    })
  );

  // Proxy for Overpass API
  app.use(
    '/overpass',
    createProxyMiddleware({
      target: 'https://overpass-api.de',
      changeOrigin: true,
      pathRewrite: {
        '^/overpass': '',
      },
    })
  );
};

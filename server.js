// server.js
const express = require("express");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // プロキシ設定
  server.use(
    "/api",
    createProxyMiddleware({
      target: "https://api.themoviedb.org", // プロキシ先のURL
      changeOrigin: true,
      pathRewrite: {
        "^/api": "" // /apiを取り除く
      }
    })
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

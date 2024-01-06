const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// 外部APIへのプロキシ設定
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.themoviedb.org",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "" // /apiを取り除く（外部APIの実際のパスに合わせる）
    }
  })
);

// ポート3000でサーバーを起動
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

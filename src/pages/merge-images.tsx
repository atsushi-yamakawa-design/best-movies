// import { useEffect, useState } from "react";
// import { createCanvas, loadImage, CanvasRenderingContext2D } from "canvas";

// function wrapText(
//   context: CanvasRenderingContext2D,
//   text: string,
//   x: number,
//   y: number,
//   maxWidth: number,
//   lineHeight: number
// ): number {
//   const words = text.split(" ");
//   let line = "";
//   let newHeight = 0; // 新しい高さを計算するための変数

//   for (let n = 0; n < words.length; n++) {
//     const testLine = line + words[n] + " ";
//     const metrics = context.measureText(testLine);
//     const testWidth = metrics.width;

//     if (testWidth > maxWidth && n > 0) {
//       context.fillText(line, x, y);
//       line = words[n] + " ";
//       y += lineHeight;
//       newHeight += lineHeight; // 行の高さを加算
//     } else {
//       line = testLine;
//     }
//   }
//   context.fillText(line, x, y);
//   newHeight += lineHeight; // 最後の行の高さを加算

//   return newHeight; // 新しい高さを返す
// }

// const ImagePage = () => {
//   const [imageSrc, setImageSrc] = useState("");

//   useEffect(() => {
//     const canvas = createCanvas(1179, 2229); // キャンバスのサイズ設定
//     const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

//     Promise.all([
//       loadImage("test/merge-images/best-movie-bg.png"),
//       loadImage("test/merge-images/mov1.jpeg"),
//       loadImage("test/merge-images/mov2.jpeg"),
//       loadImage("test/merge-images/mov3.jpeg")
//     ]).then((images) => {
//       // 背景画像の描画
//       ctx.drawImage(images[0], 0, 0, 1179, 2229);

//       const allMovieTitles = [
//         "Movie 3 Title Movie 3 Title Movie 3 Title",
//         "日本語のタイトル",
//         "Movie 3 Title Movie 3 Title Movie 3 Title",
//         "Movie 4 Title",
//         "Movie 5 Title",
//         "日本語のタイトル",
//         "Movie 7 Title",
//         "日本語のタイトル 日本語のタイトル 日本語のタイトル",
//         "Movie 9 Title",
//         "Movie 10 Title Movie 10 Title Movie 10 Title Movie 10 Title"
//       ]; // 10個の映画タイトル

//       const width = 170; // 各映画ポスターの幅
//       const positions = [
//         { x: 220, y: 400 },
//         { x: 220, y: 710 },
//         { x: 220, y: 1020 }
//       ]; // 最初の3つの画像の位置

//       images.slice(1).forEach((img, index) => {
//         const ratio = img.height / img.width;
//         const height = width * ratio; // 比率に基づく高さ
//         const { x, y } = positions[index];

//         // 画像の描画
//         ctx.drawImage(img, x, y, width, height);

//         // テキストの折り返しと総高さの計算
//         const textX = x + width + 30;
//         ctx.textAlign = "left";
//         ctx.textBaseline = "middle";
//         ctx.fillStyle = "white";
//         ctx.font = "bold 60px Arial";
//         const firstTitlesMaxWidth = 700;
//         const textY = y + 100; // 中央揃えのためのY座標

//         wrapText(
//           ctx,
//           allMovieTitles[index],
//           textX,
//           textY,
//           firstTitlesMaxWidth,
//           80
//         );
//       });

//       // 残りの映画タイトルをリスト形式で描画
//       const listStartY = 1380; // リスト開始位置のY座標
//       let listYOffset = listStartY;
//       const maxWidth = 980; // テキストの最大幅
//       const lineHeight = 60; // テキストの行の高さ

//       allMovieTitles.slice(3).forEach((title, index) => {
//         ctx.font = "bold 45px Arial";
//         const textX = 120; // テキストのX座標
//         const height = wrapText(
//           ctx,
//           `${index + 4}. ${title}`,
//           textX,
//           listYOffset,
//           maxWidth,
//           lineHeight
//         );
//         listYOffset += height + 30; // 描画したテキストの高さに応じてY座標を更新
//       });

//       // キャンバスを画像データURIとして出力
//       const dataUrl = canvas.toDataURL();
//       setImageSrc(dataUrl);
//     });
//   }, []);

//   return <div>{imageSrc && <img src={imageSrc} alt="Merged Image" />}</div>;
// };

// export default ImagePage;

import { useRef, useEffect, useState } from "react";

const ImagePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imagesToLoad = [
        "test/merge-images/best-movie-bg.png",
        "test/merge-images/mov1.jpeg"
      ];
      const imagePositions = [
        { x: 50, y: 50 },
        { x: 250, y: 300 }
      ];

      if (ctx) {
        Promise.all(
          imagesToLoad.map((src) => {
            return new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = src;
            });
          })
        ).then((images) => {
          images.forEach((img, index) => {
            const ratio = img.naturalHeight / img.naturalWidth;
            const height = 200 * ratio; // 幅を200に固定して、高さは比率を保持
            const position = imagePositions[index];
            ctx.drawImage(img, position.x, position.y, 200, height);
          });

          // 描画が完了した後にデータURLを生成
          const dataUrl = canvas.toDataURL("image/png");
          setDownloadUrl(dataUrl);
        });
      }
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width="600" height="600" />
      {downloadUrl && (
        <a href={downloadUrl} download="image.png">
          Download Image
        </a>
      )}
    </div>
  );
};

export default ImagePage;

import { useRef, useEffect, useState } from "react";

interface ImagePageProps {
  backgroundUrl: string;
  movieImageUrls: string[];
  movieTitles: string[];
}

const ShareImage = ({
  backgroundUrl,
  movieImageUrls,
  movieTitles
}: ImagePageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imagesToLoad = [backgroundUrl, ...movieImageUrls];
      const imagePositions = [
        { x: 0, y: 0 }, // 背景画像
        { x: 220, y: 400 },
        { x: 220, y: 710 },
        { x: 220, y: 1020 }
      ];
      const movieTitles = [
        "Movie Title 1",
        "Movie Title 2 Movie Title 2 Movie Title 2 Movie Title 2",
        "日本語タイトル",
        "Movie Title 4",
        "日本語タイトル 日本語タイトル 日本語タイトル",
        "Movie Title 5 Movie Title 5 Movie Title 5 Movie Title 5",
        "Movie Title 5",
        "Movie Title 5 Movie Title 5 Movie Title 5 Movie Title 5",
        "Movie Title 5",
        "Movie Title 5"
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
            if (index === 0) {
              ctx.drawImage(
                img,
                0,
                0,
                canvas.width,
                (img.naturalHeight / img.naturalWidth) * canvas.width
              );
            } else {
              const ratio = img.naturalHeight / img.naturalWidth;
              const height = 170 * ratio;
              const position = imagePositions[index];
              ctx.drawImage(img, position.x, position.y, 190, height);

              movieTitles.forEach((title, index) => {
                // 3番目までのテキスト
                ctx.fillStyle = "white";
                ctx.font = "bold 60px Arial";
                if (index < 3) {
                  const position = imagePositions[index + 1];
                  const textX = position.x + 190 + 30;
                  const imageHeight =
                    170 * (img.naturalHeight / img.naturalWidth); // 画像の実際の高さ
                  const textHeight = wrapText(
                    ctx,
                    title,
                    textX,
                    position.y,
                    700,
                    60,
                    true // 実際に描画せずにテキストの高さを計算
                  );

                  // テキストを画像の中央に配置
                  const textY =
                    position.y + imageHeight / 2 - textHeight / 2 + 30;
                  wrapText(ctx, title, textX, textY, 700, 60); // 実際に描画
                } else {
                  // 4番目以降のテキスト
                  let startY = 880 + 170 * 3;

                  movieTitles.slice(3).forEach((title, index) => {
                    const dynamicTitle = `${index + 4}. ${title}`;
                    ctx.font = "bold 45px Arial";
                    const textX = 120;
                    let textY = startY;
                    const textHeight = wrapText(
                      ctx,
                      dynamicTitle,
                      textX,
                      textY,
                      980,
                      60 // 行の高さ
                    );

                    // 次のテキストのY座標を更新
                    startY += textHeight + 30;
                  });
                }
              });
            }
          });
          const dataUrl = canvas.toDataURL("image/png");
          setDownloadUrl(dataUrl);
        });
      }
    }
  }, [backgroundUrl, movieImageUrls, movieTitles]);

  const shareImage = async () => {
    if (navigator.share && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "image.png", { type: "image/png" });
          navigator
            .share({
              files: [file],
              title: "Canvas Image",
              text: "Check out this image I created!"
            })
            .catch((error) => {
              console.error("Error sharing the image", error);
            });
        }
      }, "image/png");
    } else {
      console.log(
        "Web Share API is not supported in your browser, or canvas is null."
      );
    }
  };

  // シェアボタンの追加
  return (
    <div>
      <canvas ref={canvasRef} width="1179" height="2229" />
      <button onClick={shareImage}>Share Image</button>
    </div>
  );
};

export default ShareImage;

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  dryRun: boolean = false // 追加した引数
): number {
  const words = text.split(" ");
  let line = "";
  let newHeight = 0; // 新しい高さを計算するための変数

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      if (!dryRun) {
        context.fillText(line, x, y);
      }
      line = words[n] + " ";
      y += lineHeight;
      newHeight += lineHeight; // 行の高さを加算
    } else {
      line = testLine;
    }
  }

  if (!dryRun) {
    context.fillText(line, x, y);
  }
  newHeight += lineHeight; // 最後の行の高さを加算

  return newHeight; // 新しい高さを返す
}

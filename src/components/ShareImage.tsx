import { useRef, useEffect, useState } from "react";
import style from "./ShareImage.module.scss";

interface ImagePageProps {
  backgroundUrl: string;
  movieImageUrls: string[];
  movieTitles: string[];
  shareText: string;
}

const ShareImage = ({
  backgroundUrl,
  movieImageUrls,
  movieTitles,
  shareText
}: ImagePageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imagesToLoad = [backgroundUrl, ...movieImageUrls];
      const imagePositions = [
        { x: 0, y: 0 }, // 背景画像
        { x: 220, y: 380 },
        { x: 220, y: 690 },
        { x: 220, y: 1000 }
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
                    640,
                    70,
                    true // 実際に描画せずにテキストの高さを計算
                  );

                  // テキストを画像の中央に配置
                  const textY =
                    position.y + imageHeight / 2 - textHeight / 2 + 40;
                  wrapText(ctx, title, textX, textY, 640, 70); // 実際に描画
                } else {
                  // 4番目以降のテキスト
                  let startY = 840 + 170 * 3;

                  movieTitles.slice(3).forEach((title, index) => {
                    const dynamicTitle = `${index + 4}. ${title}`;
                    ctx.font = "bold 42px Arial";
                    const textX = 120;
                    let textY = startY;
                    const textHeight = wrapText(
                      ctx,
                      dynamicTitle,
                      textX,
                      textY,
                      960,
                      60 // 行の高さ
                    );

                    // 次のテキストのY座標を更新
                    startY += textHeight + 20;
                  });
                }
              });
            }
          });
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
              title: "My Best Movies 2023 ",
              text: shareText
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

  return (
    <div className={style.canvasContainer}>
      <canvas ref={canvasRef} width="1179" height="2229" />
      <button onClick={shareImage} className={style.shareButton}>
        Share Image
      </button>
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
  dryRun: boolean = false
): number {
  let newHeight = 0;
  const words = text.split(" ");
  let line = "";
  let lineCount = 0; // 行数をカウントする変数

  for (const word of words) {
    if (lineCount === 2) {
      // 2行を超えたら省略記号を追加して処理を終了
      line += "...";
      if (!dryRun) {
        context.fillText(line, x, y);
      }
      newHeight += lineHeight;
      break;
    }

    // 日本語か英語かによって処理を変える
    if (isJapanese(word)) {
      // 日本語の場合は文字単位で改行
      for (const char of word) {
        const testLine = line + char;
        if (context.measureText(testLine).width > maxWidth) {
          if (!dryRun) {
            context.fillText(line, x, y);
          }
          line = char;
          y += lineHeight;
          newHeight += lineHeight;
          lineCount++;
          if (lineCount === 2) {
            // 2行目に達したら次のループで省略記号を追加
            break;
          }
        } else {
          line = testLine;
        }
      }
      line += " ";
    } else {
      // 英語の単語の場合は単語単位で改行
      const testLine = line + word + " ";
      if (context.measureText(testLine).width > maxWidth) {
        if (!dryRun) {
          context.fillText(line, x, y);
        }
        line = word + " ";
        y += lineHeight;
        newHeight += lineHeight;
        lineCount++;
        if (lineCount === 2) {
          // 2行目に達したら次のループで省略記号を追加
          break;
        }
      } else {
        line = testLine;
      }
    }
  }

  // 最後の行を描画
  if (!dryRun && line.trim()) {
    context.fillText(line.trim(), x, y);
    newHeight += lineHeight;
  }

  return newHeight;
}

// 日本語かどうかを判断する簡単な関数
function isJapanese(text: string) {
  return /[\u3000-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]/.test(text);
}

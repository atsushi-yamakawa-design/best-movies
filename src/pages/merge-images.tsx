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
        "test/merge-images/mov1.jpeg",
        "test/merge-images/mov2.jpeg",
        "test/merge-images/mov3.jpeg"
      ];
      const imagePositions = [
        { x: 0, y: 0 }, // 背景画像
        { x: 220, y: 400 },
        { x: 220, y: 710 },
        { x: 220, y: 1020 }
      ];
      const movieTitles = [
        "Movie Title 1",
        "Movie Title 2",
        "Movie Title 3",
        "Movie Title 4",
        "Movie Title 5",
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
                ctx.fillStyle = "white";
                ctx.font = "bold 60px Arial";
                if (index < 3) {
                  // 最初の3つの画像に対応するテキスト
                  const position = imagePositions[index + 1];
                  const textX = position.x + 190 + 30;
                  const textY = position.y + 170 / 2;
                  ctx.textAlign = "left";
                  ctx.textBaseline = "middle";
                  ctx.fillText(title, textX, textY);
                } else {
                  // 4番目以降のテキスト
                  const dynamicTitle = `${index + 1}. ${title}`;
                  ctx.font = "bold 45px Arial";
                  const textX = 120;
                  let textY = 800 + 170 * 3 + 100 * (index - 3);
                  wrapText(ctx, dynamicTitle, textX, textY, 700, 45); // 折り返し関数を使用
                }
              });
            }
          });
          const dataUrl = canvas.toDataURL("image/png");
          setDownloadUrl(dataUrl);
        });
      }
    }
  }, []);

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

export default ImagePage;

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";

  words.forEach(function (word: string) {
    const testLine = line + word + " ";
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && line !== "") {
      context.fillText(line, x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  context.fillText(line, x, y);
}

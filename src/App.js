import React, { useState } from "react";
import ImageType from "./ImageType.js";
import ImageTable from "./ImageTable.js";
import SaveSettingFileButton from "./SaveSettingFileButton.js";

//Canvasから、指定の色がある座標を探し、座標の配列を返します。
async function getColorCoords(img, { r, g, b }) {
  const coordinates = [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const pixel_r = pixels[i];
    const pixel_g = pixels[i + 1];
    const pixel_b = pixels[i + 2];
    const pixel_a = pixels[i + 3];

    if (pixel_r === r && pixel_g === g && pixel_b === b && pixel_a === 255) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor(i / 4 / canvas.width);
      coordinates.push({ x, y });
    }
  }
  return coordinates;
}

function getImageDataForOutput(file, color) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;

      img.onload = async () => {
        const coords = await getColorCoords(img, color);
        if (coords.length !== 1) {
          const errorMessage = `${coords.length} 個の rgb(${color.r}, ${color.b}, ${color.g})色の座標が ${file.name} で検出されました。`;
          reject(errorMessage);
        } else {
          const imageData = {
            img: img,
            fileName: file.name,
            width: img.width,
            height: img.height,
            x: coords[0].x,
            y: coords[0].y,
            splitNum: 1,
            frameTimeline: 1,
          };
          resolve(imageData);
        }
      };
    };

    reader.readAsDataURL(file);
  });
}

function loadColorInTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result;
      const lines = contents.split('\n');
      const [r, g, b] = lines[1].split(',');
      resolve({ r: Number(r), g: Number(g), b: Number(b) });
    };
    reader.readAsText(file);
  });
}

function ImageSearch() {
  const [imageDatas, setImageDatas] = useState([]);
  const [responseText, setResponseText] = useState("");

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    const handleImageFile = async (color, file) => {
      try {
        const newImageData = await getImageDataForOutput(file, color);
        return newImageData;
      } catch (error) {
        throw error;
      }
    }
    try {
      const textFiles = Array.from(files).filter(file => file.type === 'text/plain');

      if (textFiles.length === 0) {
        throw new Error('Text Undroped');
      }
      const color = await loadColorInTextFile(textFiles[0]);
      const imageFiles = Array.from(files).filter(file => file.type === 'image/jpeg' || file.type === 'image/png');
      if (imageFiles.length === 0) {
        throw new Error('Image Undroped');
      }
      const newImageDatas = await Promise.all(imageFiles.map((file) => handleImageFile(color, file)));
      const sortedDatas = ImageType.sortImageDatas(newImageDatas);
      setImageDatas(sortedDatas);
    } catch (error) {
      console.error(error);
      setResponseText(error);
    }
  }
  
  return (
    <div>
      <div
        style={{
          border: "1px solid black",
          width: "400px",
          height: "400px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        ここにドロップ
      </div>
      {responseText}
      <div>
        <SaveSettingFileButton imageDatas={imageDatas} />
        <button onClick={() => { window.open('https://drive.google.com/file/d/1-cDyrxiIEmj6RDUfIR5KNgbbpf5ZkWHS/view?usp=share_link') }}>
          色透過ツールDL
        </button>
      </div>
      <ImageTable imageDatas={imageDatas} setImageDatas={setImageDatas} />
    </div>
  );
}

export default ImageSearch;

import React, { useState } from "react";
import ImageType from "./ImageType.js";

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
      console.log(pixel_r, pixel_g, pixel_b);
      const x = (i / 4) % canvas.width;
      const y = Math.floor(i / 4 / canvas.width);
      coordinates.push({ x, y });
    }
  }
  return coordinates;
}

function getImageDataForOutput(file, color) {
  console.log(color);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;

      img.onload = async () => {
        const coords = await getColorCoords(img, color);
        if (coords.length !== 1) {
          const errorMessage = `${coords.length} 個の ${color} 色の座標が ${file.name} で検出されました。`;
          reject(errorMessage);
        } else {
          const imageData = {
            img: img,
            imageOrder: 1,
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

function TableLine({ imageData, setImageData }) {
  if (imageData === undefined) {
    return;
  }
  console.log(imageData);

  const handleSplitNumChange = (e) => {
    const newImageData = { ...imageData, splitNum: Number(e.target.value) };
    setImageData(newImageData);
  }

  const handleFrameTimelineChange = (e) => {
    const newImageData = { ...imageData, frameTimeline: Number(e.target.value) };
    setImageData(newImageData);
  }

  const handleImageKindChange = (e) => {
    const newImageData = { ...imageData, imageOrder: Number(e.target.value) };
    setImageData(newImageData);
  }

  return (
    <tbody key={imageData.id}>
      <tr>
        <td width="100" height="auto">
          <img
            src={imageData.img.src}
            alt="loaded Image"
            style={{
              width: `${imageData.img.width / (imageData.splitNum )}px`,
              height: `${imageData.img.height}px`,
              objectFit: 'none'
              
            }}
          />
        </td>
        <td>
            <input
            type="number"
            value={imageData.imageOrder}
            onChange={handleImageKindChange}
          />
        </td>
        <td>{imageData.fileName}</td>
        <td>
          <input
            type="number"
            min="1"
            value={imageData.splitNum}
            onChange={handleSplitNumChange}
          />
        </td>
        <td>
          <input
            type="number"
            min="1"
            value={imageData.frameTimeline}
            onChange={handleFrameTimelineChange}
          />
        </td>
      </tr>
    </tbody>
  );

}

function Table({ imageDatas, setImageDatas }) {
  if (imageDatas.length === 0) {
    return;
  }
  console.log(imageDatas);
  const handleSetImageData = (index, newData) => {
    setImageDatas(prevState => {
      console.log(prevState);
      const newState = Object.values(prevState); // prevStateを配列に変換
      newState[index] = { ...newState[index], ...newData };
      return newState;
    });
  }
  console.log(imageDatas);
  const tableBody = Object.keys(imageDatas).map((key, index) => {
    const imageData = imageDatas[key];
    return (
      <TableLine
        imageData={imageData}
        setImageData={(newData) => handleSetImageData(key, newData)}
        key={key}
      />
    );
  });

  return (
    <table>
      <thead>
        <tr>
          <th>img</th>
          <th>imgType</th>
          <th>fileName</th>
          <th>splitNum</th>
          <th>frameTimeline</th>
        </tr>
      </thead>
      {tableBody}
    </table>
  );
}


function ImageSearch() {
  const [imageDatas, setImageDatas] = useState({});
  const [responseText, setResponseText] = useState("");

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    const handleImageFile = async (color, file, index) => {
      try {
        const newImageData = await getImageDataForOutput(file, color);
        setImageDatas(prevImageDatas => {
          return { ...prevImageDatas, [index]: newImageData };
        });
      } catch (error) {
        console.error(error);
      }
    }
    try {
      const textFiles = Array.from(files).filter(file => file.type === 'text/plain');

      if (textFiles.length === 0) {
        console.log('Text Undroped');
        return;
      }
      const color = await loadColorInTextFile(textFiles[0]);
      const imageFiles = Array.from(files).filter(file => file.type === 'image/jpeg' || file.type === 'image/png');
      if (imageFiles.length === 0) {
        console.log('Image Undroped');
        return;
      }
      await Promise.all(imageFiles.map((file, index) => handleImageFile(color, file, index)));

    } catch (error) {
      console.log(error);
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
        }}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
      </div>
      <div>
        {responseText}
      </div>
      <Table imageDatas={imageDatas} setImageDatas={setImageDatas} />
    </div>
  );
}

export default ImageSearch;

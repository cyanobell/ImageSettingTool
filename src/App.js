import React, { useState } from "react";

function ImageSearch() {
  const [imgSrc, setImgSrc] = useState(null);
  const [color, setColor] = useState("rgb(0,0,0)");
  const [coordinates, setCoordinates] = useState([]);
  const [responseText, setResponseText] = useState("");

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImgSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (event) => {
    setColor(event.target.value);
  };

  const handleSearch = () => {
    setCoordinates([]);
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    img.src = imgSrc;
    console.log(img);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (`rgb(${r},${g},${b})` === color) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor(i / 4 / canvas.width);
          setCoordinates((coordinates) => [...coordinates, { x, y }]);
        }
      }
      if(coordinates.length === 0){
        setResponseText("No pixels found");
      }else{
        setResponseText(`Found ${coordinates.length} pixels`);
      }
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
        {imgSrc && <img src={imgSrc} width="400" height="auto" alt="Uploaded image" />}
      </div>
      <div>
        {responseText}
      </div>

      <div>
        <label htmlFor="colorInput">Color:</label>
        <input type="color" id="colorInput" value={color} onChange={handleColorChange} />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        {coordinates.length > 0 &&
          coordinates.map((coordinate, index) => (
            <div key={index}>
              x: {coordinate.x}, y: {coordinate.y}
            </div>
          ))}
      </div>
    </div>
  );
}

export default ImageSearch;

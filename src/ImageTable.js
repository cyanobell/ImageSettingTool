function ImageTableLine({ imageData, setImageData}) {
  const IMAGE_WIDTH = 200;
  if (imageData === undefined) {
    return;
  }
  const handleSplitNumChange = (e) => {
    const newImageData = { ...imageData, splitNum: Number(e.target.value) };
    setImageData(newImageData);
  }

  const handleFrameTimelineChange = (e) => {
    const newImageData = { ...imageData, frameTimeline: Number(e.target.value) };
    setImageData(newImageData);
  }
  return (
    <tbody>
      <tr>
        <td width={IMAGE_WIDTH} height="auto" >
          <img
            src={imageData.img.src}
            alt="loaded"
            style={{
              width: `${Math.min(IMAGE_WIDTH, imageData.img.width / (imageData.splitNum))}px`,
              height: `${imageData.img.height}px`,
              objectFit: 'none'
            }}
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

export default function ImageTable({ imageDatas, setImageDatas }) {
  if (imageDatas.length === 0) {
    return;
  }
  const handleSetImageData = (index, newData) => {
    setImageDatas(prevState => {
      const newState = [...prevState]; // prevStateを配列に変換
      newState[index] = { ...prevState[index], ...newData };
      return newState;
    });
  }

  const tableBody = Object.values(imageDatas).map((imageData, index) => {
    return (
      <ImageTableLine
        key={index}
        imageData={imageData}
        setImageData={(newData) => handleSetImageData(index, newData)}
      />
    );
  });

  return (
    <table style={{ tableLayout: 'fixed' }}>
      <thead key='header'>
        <tr>
          <th>img</th>
          <th>fileName</th>
          <th>splitNum</th>
          <th>frameTimeline</th>
        </tr>
      </thead>
      {tableBody}
    </table>
  );
}
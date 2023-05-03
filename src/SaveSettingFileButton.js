import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default function SaveSettingFileButton({imageDatas}) {
  const handleButtonOnClick = () => {
    // CSVファイルの設定
    const fileName = 'imageList.csv';

    // CSVデータを作成する
    const csvData = [];
    const csvVersion = 2;
    csvData.push([csvVersion, 0, 0]);
    csvData.push(['fileName', 'width', 'height', 'x', 'y', 'splitNum', 'frameTimeline']);
    console.log(imageDatas);
    Object.values(imageDatas).forEach((imageData) => {
      csvData.push([
        imageData.fileName,
        imageData.width,
        imageData.height,
        imageData.x,
        imageData.y,
        imageData.splitNum,
        ...Array(imageData.splitNum).fill(imageData.frameTimeline),
      ]);
    });
    const csvBlob = new Blob([Papa.unparse(csvData, { header: false })], { type: 'text/csv;charset=utf-8;' });

    // CSVファイルをダウンロードする
    saveAs(csvBlob, fileName);
  }

  return <button onClick={() => handleButtonOnClick()}>設定ファイルを保存する</button>;
}
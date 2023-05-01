export default class ImageType{
    static ImageTypeNameList = Object.freeze([
        '待機',
        '移動',
        '前隙',
        'ショット',
        '投げ',
        '構え',
        'ソード',
        'その他'
    ]);

    static getIndex(string) {
        return ImageType.ImageTypeNameList.indexOf(string);
    }
    static getString(index) {
        return ImageType.ImageTypeNameList[index];
    }
    static StringList() {
        return ImageType.ImageTypeNameList;
    }
    static generateImageTypeOptions() {
        const imageTypeList = ImageType.ImageTypeNameList;
        return imageTypeList.map((imageType) => (
            <option key= { imageType } value = { imageType.toLowerCase() } >
            {`Type ${imageType}`}
          </option>
        ));
    }
};
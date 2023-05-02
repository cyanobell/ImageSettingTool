export default class ImageType {
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
            <option key={imageType} value={imageType.toLowerCase()} >
                {`Type ${imageType}`}
            </option>
        ));
    }

    static sortImageDatas(imageDatas) {
        const sortedDatas = Object.values(imageDatas);

        sortedDatas.sort((data_a, data_b) => {
            const a = data_a.fileName.slice(0, data_a.fileName.lastIndexOf("."));
            const b = data_b.fileName.slice(0, data_b.fileName.lastIndexOf("."));
            // Rule 1: エフェクトが存在しないものが前に配置される
            const aHasEffect = a.includes('エフェクト');
            const bHasEffect = b.includes('エフェクト');
            if (!aHasEffect && bHasEffect) {
                console.log("rule 1");
                return -1;
            }
            if (aHasEffect && !bHasEffect) {
                console.log("rule 1");
                return 1;
            }

            // Rule 2: ImageTypeNameListの順に並び替える
            const aIndex = ImageType.ImageTypeNameList.findIndex((typeName) => a.includes(typeName));
            const bIndex = ImageType.ImageTypeNameList.findIndex((typeName) => b.includes(typeName));
            if(aIndex !== bIndex){
                if (aIndex !== -1 && bIndex !== -1) {
                    console.log("rule 2");
                    return aIndex - bIndex;
                }
                if (aIndex !== -1) {
                    console.log("rule 2 sonoTa");
                    return -1;
                }
                if (bIndex !== -1) {
                    console.log("rule 2 sonoTa");
                    return 1;
                }
            }

            // Rule 3: 辞書順に並び替える
            console.log("rule 3");
            return a.localeCompare(b);
        });
        return sortedDatas;
    }
};
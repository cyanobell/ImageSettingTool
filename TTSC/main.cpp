#include <opencv2/opencv.hpp>
#include <filesystem>

namespace fs = std::filesystem;

bool isImageFile(const fs::path& filePath) {
    static const std::vector<std::string> imageExtensions = { ".bmp", ".dib", ".jpeg", ".jpg", ".jpe", ".jp2", ".png", ".webp", ".pbm", ".pgm", ".ppm", ".pxm", ".pnm", ".pfm", ".sr", ".ras", ".tiff", ".tif", ".exr", ".hdr", ".pic" };
    return std::find(imageExtensions.begin(), imageExtensions.end(), filePath.extension().string()) != imageExtensions.end();
}

std::vector<std::string> getImagePaths(const std::string& folderPath) {
    // �t�H���_���̉摜�t�@�C���̃p�X���擾
    std::vector<std::string> imagePaths;

    for (const auto& entry : fs::directory_iterator(folderPath)) {
        if (entry.is_regular_file() && isImageFile(entry.path())) {
            imagePaths.push_back(entry.path().string());
        }
    }
    return imagePaths;
}

void backupAllImages(const std::vector<std::string>& imagePaths) {
    // �e�摜�t�@�C�������l�[�����ĕۑ�
    for (const auto& imagePath : imagePaths) {
        cv::Mat image = cv::imread(imagePath, cv::IMREAD_UNCHANGED);
        if (image.empty()) {
            std::cerr << "Failed to read image file: " << imagePath << std::endl;
            continue;
        }
        fs::path folderPath(imagePath);
        folderPath.remove_filename();
        fs::path oldPath(imagePath);
        std::string filename = oldPath.filename().string();
        if (!fs::exists(folderPath / "src")) {
            fs::create_directory(folderPath / "src");
        }
        fs::path newPath = fs::path(folderPath) / "src" / filename;
        cv::imwrite(newPath.string(), image);
    }
}

void makeColorTransparent(const std::vector<std::string>& imagePaths, const cv::Scalar& color) {
    // �摜�t�@�C����ǂݍ���
    for (const auto& imagePath : imagePaths) {
        cv::Mat image = cv::imread(imagePath, cv::IMREAD_UNCHANGED);

        if (image.empty()) {
            std::cerr << "Failed to read image file: " << imagePath << std::endl;
            return;
        }

        // �w�肵���F�𓧖��ɂ���
        cv::Mat mask;
        cv::inRange(image, color, color, mask);
        std::vector<cv::Mat> channels;
        cv::split(image, channels);
        // �A���t�@�`�����l���Ɣ��]�}�X�N�̃r�b�g���Ƃ̘_���ς����߂�ƁA
        // �A���t�@�`�����l�� ��ێ������܂� �}�X�N�����̉ӏ��𓧉ߏo����B
        cv::Mat inv_mask;
        cv::bitwise_not(mask,inv_mask);
        cv::bitwise_and(channels[3], inv_mask, channels[3]);
        cv::merge(channels, image);

        // �㏑���ۑ�
        cv::imwrite(imagePath, image);
    }
}

int main(int argc, char* argv[]) {
    std::string folderPath = argv[1];

    std::vector<std::string> imagePaths = getImagePaths(folderPath);
    backupAllImages(imagePaths);
    // �摜�̎w�肵���F�𓧖��ɂ��ĕۑ�
    int r = atoi(argv[2]);
    int g = atoi(argv[3]);
    int b = atoi(argv[4]);
    // �s�����̎w��F�̂ݓ���
    cv::Scalar color = cv::Scalar(b, g, r, 255);
    makeColorTransparent(imagePaths, color);

    return 0;
}

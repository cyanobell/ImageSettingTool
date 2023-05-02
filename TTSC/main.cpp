#include <opencv2/opencv.hpp>
#include <Windows.h>
#include <filesystem>
#include <iostream>
#include <fstream>

namespace fs = std::filesystem;

bool isImageFile(const fs::path& filePath) {
    static const std::vector<std::string> imageExtensions = { ".bmp", ".dib", ".jpeg", ".jpg", ".jpe", ".jp2", ".png", ".webp", ".pbm", ".pgm", ".ppm", ".pxm", ".pnm", ".pfm", ".sr", ".ras", ".tiff", ".tif", ".exr", ".hdr", ".pic" };
    return std::find(imageExtensions.begin(), imageExtensions.end(), filePath.extension().string()) != imageExtensions.end();
}

std::vector<std::string> getImagePaths(const std::string& folderPath) {
    // フォルダ内の画像ファイルのパスを取得
    std::vector<std::string> imagePaths;

    for (const auto& entry : fs::directory_iterator(folderPath)) {
        if (entry.is_regular_file() && isImageFile(entry.path())) {
            imagePaths.push_back(entry.path().string());
        }
    }
    return imagePaths;
}

void backupAllImages(const std::vector<std::string>& imagePaths) {
    // 各画像ファイルをリネームして保存
    for (const auto& imagePath : imagePaths) {
        cv::Mat image = cv::imread(imagePath, cv::IMREAD_UNCHANGED);
        if (image.empty()) {
            std::cerr << "Failed to read image file: " << imagePath << std::endl;
            continue;
        }
        fs::path folderPath = fs::path(imagePath).remove_filename();
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
    // 画像ファイルを読み込む
    for (const auto& imagePath : imagePaths) {
        cv::Mat image = cv::imread(imagePath, cv::IMREAD_UNCHANGED);

        if (image.empty()) {
            std::cerr << "Failed to read image file: " << imagePath << std::endl;
            return;
        }

        // 指定した色を透明にする
        cv::Mat mask;
        cv::inRange(image, color, color, mask);
        std::vector<cv::Mat> channels;
        cv::split(image, channels);
        // アルファチャンネルと反転マスクのビットごとの論理積を求めると、
        // アルファチャンネル を保持したまま マスクが白の箇所を透過出来る。
        cv::Mat inv_mask;
        cv::bitwise_not(mask,inv_mask);
        cv::bitwise_and(channels[3], inv_mask, channels[3]);
        cv::merge(channels, image);

        // 上書き保存
        cv::imwrite(imagePath, image);
    }
}

void deleteSelfExe(std::string exeName) {
    std::string batName = exeName + "Deleter.bat";
    std::ofstream ofs(exeName + "Deleter.bat");
    if (!ofs.is_open()) {
        std::cerr << "Failed to create the file." << std::endl;
        return;
    }
    ofs << "@echo off" << std::endl
        << "echo 終了処理中..." << std::endl
        << "timeout /t 1 /nobreak > nul" << std::endl
        << "if exist \"" + exeName + "\" (" << std::endl
        << "  del \"" + exeName + "\"" << std::endl
        << ")" << std::endl
        << "if exist \"" + batName + "\" (" << std::endl
        << "  del \"" + batName + "\"" << std::endl
        << ")" << std::endl
        << "exit" << std::endl;
    ofs.close();
    std::cout << "The file has been created." << std::endl;

    ShellExecute(NULL, "open", batName.c_str(), NULL, NULL, SW_SHOW);
    return;
}

int main(int argc, char* argv[]) {
    std::string exePath = argv[0];
    std::string folderPath = fs::path(exePath).remove_filename().string();

    std::vector<std::string> imagePaths = getImagePaths(folderPath);
    backupAllImages(imagePaths);
    // 画像の指定した色を透明にして保存
    int r = atoi(argv[1]);
    int g = atoi(argv[2]);
    int b = atoi(argv[3]);
    // 不透明の指定色のみ透過
    cv::Scalar color = cv::Scalar(b, g, r, 255);
    makeColorTransparent(imagePaths, color);
    std::string exeName = fs::path(exePath).filename().string();
    deleteSelfExe(exeName);
    return 0;
}

package com.slice.reactminiospring.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.slice.reactminiospring.common.R;
import com.slice.reactminiospring.entity.Files;
import com.slice.reactminiospring.model.FileUploadInfo;
import com.slice.reactminiospring.model.UploadUrlsVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * 文件表 服务类
 */
public interface IFilesService extends IService<Files> {

    R<FileUploadInfo> checkFileByMd5(String md5);

    R<UploadUrlsVO> initMultipartUpload(FileUploadInfo fileUploadInfo);

    R<String> mergeMultipartUpload(String md5);

    ResponseEntity<byte[]> downloadMultipartFile(Long id, HttpServletRequest request, HttpServletResponse response) throws Exception;

    R<List<Files>> getFileList();
}

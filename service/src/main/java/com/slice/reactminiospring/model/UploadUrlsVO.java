package com.slice.reactminiospring.model;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

/**
 * 返回文件生成的分片上传地址
 */
@Data
@Accessors(chain = true)
public class UploadUrlsVO {
    private String uploadId;
    private List<String> urls;
}

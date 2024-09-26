package com.slice.reactminiospring.enums;

public enum HttpCodeEnum {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    UPLOAD_SUCCESS(2001, "上传成功"),
    UPLOADING(2002, "上传中"),
    NOT_UPLOADED(2003, "未上传"),
    UPLOAD_FILE_FAILED(5001, "文件上传失败");


    private final int code;
    private final String msg;

    HttpCodeEnum(int code, String errorMessage) {
        this.code = code;
        this.msg = errorMessage;
    }

    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
}
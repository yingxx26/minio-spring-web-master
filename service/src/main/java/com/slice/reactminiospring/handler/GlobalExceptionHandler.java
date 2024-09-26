package com.slice.reactminiospring.handler;

import com.slice.reactminiospring.common.R;
import com.slice.reactminiospring.enums.HttpCodeEnum;
import com.slice.reactminiospring.exception.ConditionException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ResponseBody
    @ExceptionHandler(value = Exception.class)
    public R<?> commonExceptionHandler(HttpServletRequest request, Exception e) {
        String errorMsg = e.getMessage();
        log.error("[全局异常] 错误信息： {}; 请求地址：{} {}", errorMsg, request.getMethod(), request.getRequestURI());
        return R.fail(HttpCodeEnum.FAIL.getCode(), errorMsg);
    }

    @ResponseBody
    @ExceptionHandler(value = ConditionException.class)
    public R<?> MyExceptionHandler(HttpServletRequest request, ConditionException e) {
        String errorMsg = e.getMessage();
        int errorCode = e.getCode();
        log.error("[自定义异常] 错误信息： {};  请求地址：{} {}", errorMsg, request.getMethod(), request.getRequestURI());
        return R.fail(errorCode, errorMsg);
    }
}
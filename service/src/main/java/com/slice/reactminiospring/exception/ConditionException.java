package com.slice.reactminiospring.exception;

import com.slice.reactminiospring.enums.HttpCodeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ConditionException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 1L;

    private int code;

    private String msg;

    public ConditionException(HttpCodeEnum httpEnum) {
        super(httpEnum.getMsg());  //super的是RuntimeException
        this.code = httpEnum.getCode();
        this.msg = httpEnum.getMsg();
    }

    /**
     * 入参为错误信息
     * @param msg 错误信息
     */
    public ConditionException(String msg) {
        super(msg);
        code = HttpCodeEnum.FAIL.getCode();
        this.msg = msg;
    }
}

package com.slice.reactminiospring;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.slice.reactminiospring.mapper")
public class ReactMinioSpringApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReactMinioSpringApplication.class, args);
    }

}

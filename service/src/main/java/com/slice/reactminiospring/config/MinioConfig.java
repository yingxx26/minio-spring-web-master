package com.slice.reactminiospring.config;

import io.minio.MinioClient;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {
    @Resource
    private MinioConfigInfo minIOConfigInfo;

    @Bean
    public MinioClient minioClient() {
        //链式编程，构建MinioClient对象
        return MinioClient.builder()
                .endpoint(minIOConfigInfo.getEndpoint())
                .credentials(minIOConfigInfo.getAccessKey(), minIOConfigInfo.getSecretKey())
                .build();
    }
}

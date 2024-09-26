package com.slice.reactminiospring;

import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ReactMinioSpringApplicationTests {

    @Resource
    private MinioClient minioClient;

    /**
     * 创建公共只读权限的 minio 桶
     * @throws Exception
     */
    @Test
    void creatPublicReadOnlyBucket() throws Exception {
        String bucketName = "public-readonly-file";
        // 创建桶
        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        // 需要的就是这一串代码访问策略
        String policyJsonString = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"PublicRead\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"*\"},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
        minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
                .bucket(bucketName)
                .config(policyJsonString)
                .build());
    }

}

drop table if exists files;
create table files
(
    id               bigint auto_increment,
    upload_id        varchar(255) comment '文件上传id',
    md5              varchar(255) comment '文件计算md5',
    url              varchar(255) comment '文件访问地址',
    bucket           varchar(64) comment '存储桶',
    object           varchar(255) comment 'minio中文件名',
    origin_file_name varchar(255) comment '原始文件名',
    size             bigint comment '文件大小',
    type             varchar(64) comment '文件类型',
    chunk_size       long comment '分片大小',
    chunk_count      int comment '分片数量',
    is_delete        char         default '0' comment '是否删除',
    create_time      timestamp(6) default current_timestamp(6) comment '创建时间',
    primary key (id)
) comment '文件表';
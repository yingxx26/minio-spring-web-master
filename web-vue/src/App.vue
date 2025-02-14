<script setup lang="ts">
import {ref} from 'vue'
import FileTable from './components/FileTable.vue'
import UploadModal from './components/UploadModal.vue'

import MyFileTable from './components/MyFileTable.vue'
import MyUploadModal from './components/MyUploadModal.vue'

const visible = ref(false)
const myVisible = ref(false)
</script>

<template>
  <div style="margin-bottom: 20px; text-align: left">
    <a-button type="primary" @click="visible = true">上传文件</a-button>
  </div>

  <FileTable/>
  <UploadModal v-model:visible="visible"/>


  <div style="margin-bottom: 20px; text-align: left">
    <a-button type="primary" @click="myVisible = true">我的上传文件</a-button>
  </div>
  <MyFileTable/>
  <MyUploadModal v-model:visible="myVisible"/>
</template>

<style>
#app {
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
</style>

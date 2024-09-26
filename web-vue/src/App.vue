<script setup lang="ts">
import { ref } from 'vue'
import FileTable from './components/FileTable.vue'
import UploadModal from './components/UploadModal.vue'

const visible = ref(false)
</script>

<template>
  <div style="margin-bottom: 20px; text-align: left">
    <a-button type="primary" @click="visible = true">上传文件</a-button>
  </div>

  <FileTable />
  <UploadModal v-model:visible="visible" />
</template>

<style>
#app {
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
</style>

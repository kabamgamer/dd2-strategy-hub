<template>
  <QuillEditor toolbar="minimal" :modules="modules" v-bind:content="modelValue" @update:content="onContentChange" contentType="html" />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

import useUserMediaApi from "@/api/UserMedia";

import { QuillEditor } from "@vueup/vue-quill";

// @ts-ignore
import ImageUploader from 'quill-image-uploader';

const emit = defineEmits(['update:modelValue', 'change', 'userUpload']);

const { uploadMedia } = useUserMediaApi();

defineProps({
  modelValue: String,
});

const modules = ref([{
  name: 'imageUploader',
  module: ImageUploader,
  options: {
    upload: onMediaUpload,
  }
}])

function onContentChange(content: string): void {
  emit('update:modelValue', content);
  emit('change', content);
}

function onMediaUpload(file: any): Promise<string> {
  return new Promise((resolve, reject): void => {
    uploadMedia(file)
        .then((result: any) => {
          emit('userUpload', result.url);
          resolve(result.url);
        })
        .catch((error: any) => {
          reject('Upload failed');
          console.error(error);
        });
  })
}
</script>

<style scoped>

</style>
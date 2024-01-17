<template>
  <QuillEditor toolbar="minimal" :modules="modules" v-bind:content="modelValue" @update:content="onContentChange" contentType="html" />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

import useUserMediaApi from "@/api/UserMedia";
import { useNotificationStore } from "@/stores/Notifications";

import { QuillEditor } from "@vueup/vue-quill";

// @ts-ignore
import ImageUploader from 'quill-image-uploader';

const notificationStore = useNotificationStore();
const emit = defineEmits(['update:modelValue', 'change', 'userUpload']);

const { uploadMedia } = useUserMediaApi();
const { notificationsFromErrors } = notificationStore

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
        .catch((response: any) => {
          console.error(response);

          if (response.errors) {
            notificationsFromErrors(response.errors, 'quill-editor')
          }

          reject('Upload failed');
        });
  })
}
</script>

<style scoped>

</style>
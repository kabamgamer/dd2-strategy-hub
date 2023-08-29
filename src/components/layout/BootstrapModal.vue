<template>
  <div class="modal fade" :class="{ 'modal-xl': isLarge }" tabindex="-1" aria-labelledby=""
       aria-hidden="true" ref="modalElement">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot name="body" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineEmits } from "vue";
import { Modal } from "bootstrap";

defineProps({
  title: String,
  isLarge: Boolean,
});

const emit = defineEmits(['show', 'hide']);

let modalElement = ref();
let modalObject: Modal|null = null;

onMounted((): void => {
  modalElement.value.addEventListener('hidden.bs.modal', function () {
    emit('hide');
  })

  // Make sure modal is always last item in body
  document.body.appendChild(modalElement.value)
  modalObject = new Modal(modalElement.value)
});

function _show(): void {
  modalObject?.show();
}

function _hide(): void {
  modalObject?.hide();
}
defineExpose({ show: _show, hide: _hide });
</script>
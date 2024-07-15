<template>
  <div class="map-icon">
    <div class="icon" ref="iconElement" v-if="!editMode" :style="defensePositionCss">
      <DigitIcon :icon-id="iconId" />
    </div>

    <ContextMenu ref="contextMenu" v-else>
      <template #trigger>
        <div class="icon" ref="iconElement">
          <DigitIcon :icon-id="iconId" />
        </div>
      </template>

      <template #menu-items>
        <a href="#" class="context-menu-item delete" @click.prevent="emit('delete')"><IconCross /></a>
      </template>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from "vue";
import type { PropType } from "vue";

// @ts-ignore
import Draggabilly from "draggabilly/draggabilly.js";

import ContextMenu from "@/components/utilities/CommunityMaps/Defense/ContextMenu.vue";

import DigitIcon from "@/components/icons/digits/DigitIcon.vue";
import IconCross from "@/components/icons/IconCross.vue";

const props = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
  iconId: {
    type: Number,
    required: true,
  },
  position: {
    type: Object as PropType<{ x: number, y: number }>,
    required: false,
  },
});

const emit = defineEmits(['delete', 'duplicate', 'selectDefense', 'update:position', 'update:rotation']);

const iconElement = ref<HTMLElement | null>(null)
const contextMenu = ref<typeof ContextMenu>()
const draggableIconElement = ref<Draggabilly>()
const defensePositionCss = computed(() => ({
  top: `${(props.position as { x: number, y: number }).y}px`,
  left: `${(props.position as { x: number, y: number }).x}px`,
}))

onMounted(() => {
  if (!props.editMode) {
    return
  }

  draggableIconElement.value = new Draggabilly(contextMenu.value?.$el, {
    containment: '.map'
  });

  draggableIconElement.value.setPosition((props.position as { x: number, y: number }).x, (props.position as { x: number, y: number }).y)

  draggableIconElement.value.on('dragEnd', () => {
    emit('update:position', draggableIconElement.value.position)
  });

  draggableIconElement.value.on('staticClick', () => {
    // Open context menu
    contextMenu.value?.open()

    // Close menu on click outside
    document.addEventListener('click', (event) => {
      if (!contextMenu.value?.$el.contains(event.target as Node)) {
        contextMenu.value?.close()
      }
    })
  });
});
</script>

<style lang="scss" scoped>
.context-menu-item {
  background: white;
  color: var(--bs-primary);
  font-size: small;
  line-height: 25px;
  height: 30px;
  width: 30px;
  margin-left: -15px;
  margin-top: -15px;
  border-radius: 50%;

  &.delete {
    color: var(--bs-red);
  }
}
</style>

<style lang="scss">
.map-icon {
  .icon,
  .circular-menu,
  .icon svg {
    width: 40px;
    height: 40px;
    line-height: 40px;
  }

  .icon {
    position: absolute;
    top: 0;
    left: 0;
    text-decoration: none;
    text-align: center;
    color: #444;
    display: block;

    img, svg {
      vertical-align: top;
    }
  }

  nav .icon {
    cursor: pointer;

    &::after {
      content: "";
      position: absolute;
      top: -2px;
      left: -2px;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      background-color: white;
      opacity: 0; /* Start fully transparent */
      border-radius: 50%;
      transition: opacity 0.3s ease;
    }

    &:hover::after {
      opacity: 0.5; /* On hover, make it semi-transparent */
    }
  }
}
</style>

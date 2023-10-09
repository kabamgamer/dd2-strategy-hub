<template>
  <div class="map-defense">
    <ContextMenu ref="contextMenu">
      <template #trigger>
        <div class="defense" ref="defenseElement">
          <img src="/assets/maps/defenses/squire_ballista.png" alt="Defense ballista">
        </div>
      </template>

      <template #menu-items>
        <a href="#" class="context-menu-item delete" @click.prevent><IconCross /></a>
        <a href="#" class="context-menu-item rotate" @click.prevent="onRotate"><IconRotate /></a>
      </template>
    </ContextMenu>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// @ts-ignore
import Draggabilly from "draggabilly/draggabilly.js";

import ContextMenu from "@/components/utilities/CommunityMaps/Defense/ContextMenu.vue";

import { useRotateElement } from "@/composables/RotateElement";
import IconCross from "@/components/icons/IconCross.vue";
import IconRotate from "@/components/icons/IconRotate.vue";

const { rotate } = useRotateElement();
const defenseElement = ref<HTMLElement | null>(null);
const contextMenu = ref<ContextMenu>();
const draggableDefenseElement = ref<Draggabilly>();

function onRotate() {
  contextMenu.value?.close()
  rotate(defenseElement.value, contextMenu.value.$el)
}

onMounted(() => {
  draggableDefenseElement.value = new Draggabilly(contextMenu.value.$el, {
    containment: '.map'
  });

  draggableDefenseElement.value.on('dragEnd', () => {
    console.log(draggableDefenseElement.value.position);
  });

  draggableDefenseElement.value.on('staticClick', () => {
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

<style scoped>
.defense,
.defense img {
  width: 40px;
  height: 40px;
}

.defense {
  cursor: pointer;
  position: absolute;
  top: calc(50% - 20px);
  left: calc(50% - 20px);
  text-decoration: none;
  text-align: center;
  color: #444;
  display: block;
  height: 40px;
  width: 40px;
  line-height: 40px;
}

.context-menu-item {
  background: white;
  color: var(--bs-primary);
  font-size: small;
  line-height: 30px;
  height: 30px;
  width: 30px;
  margin-left: -15px;
  margin-top: -15px;
  border-radius: 50%;
}
.context-menu-item.delete {
  color: var(--bs-red);
}
</style>

<style>
.map-defense .circular-menu {
  width: 40px;
  height: 40px;
}
</style>

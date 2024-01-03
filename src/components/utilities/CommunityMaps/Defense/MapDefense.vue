<template>
  <div class="map-defense">
    <div class="defense" ref="defenseElement" :class="{ xs: isXSmallIcon, s: isSmallIcon, l: isLargeIcon, xl: isXLargeIcon }" v-if="!editMode" :style="defensePositionCss" @click="onDefenseClick">
      <img :src="cdn('/media/maps/defenses/' + icon)" alt="Defense icon">
    </div>

    <ContextMenu ref="contextMenu" v-else>
      <template #trigger>
        <div class="defense" ref="defenseElement" :class="{ xs: isXSmallIcon, s: isSmallIcon, l: isLargeIcon, xl: isXLargeIcon  }" :style="{transform: `rotate(${rotation}deg)`}">
          <img :src="cdn('/media/maps/defenses/' + icon)" alt="Defense icon">
        </div>
      </template>

      <template #menu-items>
        <a href="#" class="context-menu-item delete" @click.prevent="emit('delete')"><IconCross /></a>
        <a href="#" class="context-menu-item rotate" @click.prevent="onRotate"><IconRotate /></a>
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

import { useRotateElement } from "@/composables/RotateElement";
import useCdn from "@/composables/Cdn";
import IconCross from "@/components/icons/IconCross.vue";
import IconRotate from "@/components/icons/IconRotate.vue";

const props = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    required: true,
  },
  rotation: {
    type: Number,
    default: 0,
  },
  position: {
    type: Object as PropType<{ x: number, y: number }>,
    required: false,
  },
});

const emit = defineEmits(['delete', 'selectDefense', 'update:position', 'update:rotation']);

const { rotate } = useRotateElement(emit, 'update:rotation')
const { cdn } = useCdn()
const defenseElement = ref<HTMLElement | null>(null)
const contextMenu = ref<typeof ContextMenu>()
const draggableDefenseElement = ref<Draggabilly>()
const defensePositionCss = computed(() => ({
  top: `${(props.position as { x: number, y: number }).y}px`,
  left: `${(props.position as { x: number, y: number }).x}px`,
  transform: `rotate(${props.rotation}deg)`,
}))

const isXSmallIcon = computed(() => [
  'ev2_proton_beam.png',
  'ev2_reflect_beam.png',
  'ev2_buff_beam.png',
  'ev2_weapon_manufacturer.png',
].includes(props.icon as string))
const isSmallIcon = computed(() => [
  'squire_cannonball.png',
  'monk_lightning_strikes_aura.png',
  'initiate_frost_strikes_aura.png',
].includes(props.icon as string))
const isLargeIcon = computed(() => [
  'initiate_firework_cannon.png',
].includes(props.icon as string))
const isXLargeIcon = computed(() => [
  'countess_elder_dragon.png',
].includes(props.icon as string))

function onDefenseClick(): void {
  emit('selectDefense')
}

function onRotate(): void {
  contextMenu.value?.close()
  rotate(defenseElement.value)
}

onMounted(() => {
  if (!props.editMode) {
    return
  }

  draggableDefenseElement.value = new Draggabilly(contextMenu.value?.$el, {
    containment: '.map'
  });

  draggableDefenseElement.value.setPosition((props.position as { x: number, y: number }).x, (props.position as { x: number, y: number }).y)

  draggableDefenseElement.value.on('dragEnd', () => {
    emit('update:position', draggableDefenseElement.value.position)
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
  width: 30px;
  height: 30px;
  line-height: 30px;
}
.defense.xs,
.defense.xs img {
  width: 20px;
  height: 20px;
  line-height: 20px;
}
.defense.s,
.defense.s img {
  width: 25px;
  height: 25px;
  line-height: 20px;
}
.defense.l,
.defense.l img {
  width: 40px;
  height: 40px;
  line-height: 60px;
}
.defense.xl,
.defense.xl img {
  width: 60px;
  height: 60px;
  line-height: 60px;
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
  line-height: 40px;
}

.defense img {
  object-fit: contain;
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

.map-defense.hide {
  opacity: .3;
}
</style>

<style>
.map-defense .circular-menu {
  width: 40px;
  height: 40px;
}
</style>

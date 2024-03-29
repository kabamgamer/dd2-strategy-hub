<template>
  <div class="map-defense" :class="sizeClass">
    <div class="defense" ref="defenseElement" v-if="!editMode" :style="defensePositionCss" @click="onDefenseClick">
      <img v-if="showDefenseIcon" :src="cdn('/media/maps/defenses/' + defense?.mapIcon)" alt="Defense icon">
      <div v-else :class="{ omni: defense?.attackAngle === 360, node: defense?.hero === 'Ev2' }" :style="{color: legendColor}">
        <IconDefenseCircle v-if="defense?.attackAngle === 360" />
        <IconDefense v-else />
      </div>
    </div>

    <ContextMenu ref="contextMenu" v-else>
      <template #trigger>
        <div class="defense" ref="defenseElement" :style="{transform: `rotate(${rotation}deg)`}">
          <img v-if="showDefenseIcon" :src="cdn('/media/maps/defenses/' + defense?.mapIcon)" alt="Defense icon">
          <div v-else :class="{ omni: defense?.attackAngle === 360, node: defense?.hero === 'Ev2' }" :style="{color: legendColor}">
            <IconDefenseCircle v-if="defense?.attackAngle === 360" />
            <IconDefense v-else />
          </div>
        </div>
      </template>

      <template #menu-items>
        <a href="#" class="context-menu-item delete" @click.prevent="emit('delete')"><IconCross /></a>
        <a href="#" class="context-menu-item rotate" v-if="defense?.attackAngle !== 360" @click.prevent="onRotate"><IconRotate /></a>
        <a href="#" class="context-menu-item rotate" @click.prevent="emit('duplicate')"><IconDuplicate /></a>
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
import IconDefense from "@/components/icons/IconDefense.vue";
import IconDuplicate from "@/components/icons/IconDuplicate.vue";
import IconDefenseCircle from "@/components/icons/IconDefenseCircle.vue";

import type { DefenseRootInterface } from "@/types";

const props = defineProps({
  showDefenseIcon: {
    type: Boolean,
    default: true,
  },
  legendColor: {
    type: String,
    default: '#444',
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  defense: {
    type: Object as PropType<DefenseRootInterface>,
    required: false,
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

const emit = defineEmits(['delete', 'duplicate', 'selectDefense', 'update:position', 'update:rotation']);

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

const sizeClass = computed(() => {
  return {"no-icon": !props.showDefenseIcon, xs: isXSmallIcon.value, s: isSmallIcon.value, l: isLargeIcon.value, xl: isXLargeIcon.value}
})
const isXSmallIcon = computed(() => [
  'ev2_proton_beam.png',
  'ev2_reflect_beam.png',
  'ev2_buff_beam.png',
  'ev2_weapon_manufacturer.png',
].includes(props.defense?.mapIcon as string))
const isSmallIcon = computed(() => [
  'squire_cannonball.png',
  'monk_lightning_strikes_aura.png',
  'initiate_frost_strikes_aura.png',
].includes(props.defense?.mapIcon as string))
const isLargeIcon = computed(() => [
  'initiate_firework_cannon.png',
].includes(props.defense?.mapIcon as string))
const isXLargeIcon = computed(() => [
  'countess_elder_dragon.png',
].includes(props.defense?.mapIcon as string))

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

.map-defense.hide {
  opacity: .3;
}
</style>

<style lang="scss">
.map-defense {
  .defense,
  .circular-menu,
  .defense img {
    width: 30px;
    height: 30px;
    line-height: 30px;
  }

  &.xs {
    .circular-menu,
    .defense,
    .defense img {
      width: 20px;
      height: 20px;
      line-height: 20px;
    }

    &.no-icon .defense {
      margin: 0;
    }
  }

  &.s {
    .circular-menu,
    .defense,
    .defense img {
      width: 25px;
      height: 25px;
      line-height: 20px;
    }
  }

  &.l {
    .circular-menu,
    .defense,
    .defense img {
      width: 40px;
      height: 40px;
      line-height: 60px;
    }

    &.no-icon .defense {
      margin: 5px 10px;
    }
  }

  &.xl {
    .circular-menu,
    .defense,
    .defense img {
      width: 60px;
      height: 60px;
      line-height: 60px;
    }

    &.no-icon .defense {
      margin: 20px;
    }
  }

  &.no-icon {
    .circular-menu,
    .defense,
    svg {
      width: 20px;
      height: 20px;
    }

    .defense {
      margin: 5px;
    }
  }

  .defense {
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
    text-decoration: none;
    text-align: center;
    color: #444;
    display: block;

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

    img {
      object-fit: contain;
    }

    img, svg {
      vertical-align: top;
    }

    .omni {
      scale: .9;
    }

    .node {
      scale: .5;
    }
  }
}
</style>

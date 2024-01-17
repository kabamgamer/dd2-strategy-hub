<template>
  <nav class="circular-menu">
    <div class="circle" :class="{open, mini: isMiniCircle}" ref="menu">
      <slot name="menu-items" />
    </div>

    <slot name="trigger" />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

const menu = ref<HTMLElement>();
const open = ref(false);
const isMiniCircle = computed(() => (menu.value?.querySelectorAll("a").length ?? 0) <= 3);

function openMenu(): void {
  open.value = true
}

function closeMenu(): void {
  open.value = false
}

onMounted(() => {
  const items = menu.value?.querySelectorAll("a");
  if (items) {
    for(let i = 0, l = items.length; i < l; i++) {
      items[i].style.left = ((items.length === 2 ? 30 : 0) + (50 - 35*Math.cos(-0.5 * Math.PI - 2*(1/l)*i*Math.PI))).toFixed(4) + "%";
      items[i].style.top = (50 + 35*Math.sin(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
    }
  }
})

defineExpose({ open: openMenu, close: closeMenu });
</script>

<style>
.circular-menu {
  width: 0;
  height: 0;
  margin: 0 auto;
  position: absolute;
}

.circular-menu .circle {
  width: 250px;
  height: 250px;
  opacity: 0;
  transform: scale(0);

  -webkit-transition: all 0.4s ease-out;
  -moz-transition: all 0.4s ease-out;
  transition: all 0.4s ease-out;
}
.circular-menu .circle.mini {
  width: 150px;
  height: 150px;
}

.circular-menu .circle.open {
  opacity: 1;
  transform: scale(1) translate(-40%, -35%);
}

.circular-menu .circle a {
  text-decoration: none;
  display: block;
  height: 40px !default;
  width: 40px !default;
  line-height: 40px !default;
  margin-left: -20px !default;
  margin-top: -20px !default;
  position: absolute;
  text-align: center;
}

.circular-menu .circle a:hover {
  color: #eef;
}
</style>
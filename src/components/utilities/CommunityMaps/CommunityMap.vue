<template>
  <div class="map">
    <img src="/assets/maps/map_dragonfall_town_gates_of_dragonfall.png" alt="Gates of Dragonfall">

    <slot name="defenses">
    </slot>
  </div>
</template>

<style scoped>
.map img {
  width: 1080px;
  height: auto;
  object-fit: contain;
  object-position: top;
}
</style>
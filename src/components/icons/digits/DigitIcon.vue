<template>
    <IconOne v-if="iconId === 1" />
    <IconTwo v-if="iconId === 2" />
    <IconThree v-if="iconId === 3" />
    <IconFour v-if="iconId === 4" />
    <IconFive v-if="iconId === 5" />
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

import IconOne from "@/components/icons/digits/IconOne.vue";
import IconTwo from "@/components/icons/digits/IconTwo.vue";
import IconThree from "@/components/icons/digits/IconThree.vue";
import IconFour from "@/components/icons/digits/IconFour.vue";
import IconFive from "@/components/icons/digits/IconFive.vue";

defineProps({
    iconId: Number,
});
</script>
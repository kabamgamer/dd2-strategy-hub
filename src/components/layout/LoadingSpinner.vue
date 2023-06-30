<template>
  <div class="loading">
    <span class="spinner"></span>
  </div>
</template>

<style scoped>
.loading {
  position: absolute;
  z-index: 150;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, .7);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #272727;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

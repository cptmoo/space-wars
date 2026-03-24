<template>
  <div class="menu-wrap" :class="{ open }">
    <button class="menu-trigger" @click="$emit('toggle')" aria-label="Open menu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div v-if="open" class="menu-panel card">
      <button class="menu-item" @click="$emit('new-game')">New game</button>
      <button class="menu-item" @click="$emit('restart')">Restart</button>
      <button class="menu-item" @click="$emit('help')">Help</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
})

defineEmits(['toggle', 'new-game', 'restart', 'help'])
</script>

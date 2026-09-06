<script setup>
defineProps({
  theme: { type: String, required: true },
  loading: { type: Boolean, default: false },
  syncState: { type: String, required: true }
});

defineEmits(["toggle-theme", "refresh"]);
</script>

<template>
  <header class="app-header">
    <div class="brand-lockup">
      <div class="brand-mark">EV</div>
      <div><p class="brand-overline">EASY VIBE / PROJECT CONTROL</p><h1>项目状态台</h1></div>
    </div>
    <div class="header-actions">
      <span class="sync-state" :class="{ loading }">{{ syncState }}</span>
      <span class="source-lock">固定项目根目录</span>
      <button class="theme-toggle" type="button" title="切换亮暗主题" @click="$emit('toggle-theme')">{{ theme === "dark" ? "☾ 暗色" : "☼ 亮色" }}</button>
      <button class="icon-button" type="button" title="刷新项目数据" @click="$emit('refresh')">↻</button>
    </div>
  </header>
</template>

<script setup>
defineProps({ activeView: { type: String, required: true } });
defineEmits(["select"]);
const views = [
  ["overview", "总览", "项目判断", "⌂"],
  ["guide", "向导", "接入路径", "↗"],
  ["workflow", "工作流", "交付逻辑", "◎"],
  ["rules", "规则", "治理边界", "⌘"],
  ["engineering", "工程规范", "实现格式", "◇"],
  ["status", "状态", "工作进度", "▤"],
  ["directories", "目录", "结构健康", "▦"]
];
</script>

<template>
  <aside class="workspace-sidebar">
    <div class="sidebar-heading"><p class="kicker">WORKSPACE</p><strong>项目导航</strong></div>
    <nav class="view-nav" aria-label="项目视图">
      <button v-for="view in views" :key="view[0]" class="view-tab" :class="{ active: activeView === view[0] }" type="button" @click="$emit('select', view[0])">
        <span class="tab-icon" aria-hidden="true">{{ view[3] }}</span>
        <span class="tab-copy"><b>{{ view[1] }}</b><small>{{ view[2] }}</small></span>
      </button>
    </nav>
    <div class="sidebar-footnote"><span class="live-dot"></span><div><strong>只读工作台</strong><small>数据来自当前项目文件</small></div></div>
  </aside>
</template>

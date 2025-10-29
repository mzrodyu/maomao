<template>
  <div
    class="memory-panel-container"
    style="display: flex; flex-direction: column; height: 100%; background: #1a1a1a; color: #e0e0e0"
  >
    <!-- 面板头部 -->
    <div
      class="panel-header"
      style="
        padding: 15px 20px;
        background: #2a2a2a;
        border-bottom: 1px solid #3a3a3a;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px 8px 0 0;
        flex-shrink: 0;
      "
    >
      <div class="header-left" style="display: flex; align-items: center; gap: 10px">
        <span style="font-size: 24px">🐱</span>
        <b>mzrodyu猫猫的小破烂</b>
      </div>
      <div
        class="close-button"
        style="cursor: pointer; padding: 5px 10px; border-radius: 4px; transition: background 0.2s"
        @click="closePanel"
      >
        <i class="fa-solid fa-times"></i>
      </div>
    </div>

    <!-- 面板标签栏 -->
    <div
      class="panel-tabs"
      style="display: flex; background: #2a2a2a; border-bottom: 1px solid #3a3a3a; flex-shrink: 0"
    >
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ 'tab-active': activeTab === tab.key }"
        class="tab-item"
        :style="{
          flex: '1',
          padding: '12px 20px',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'background 0.2s, color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          borderBottom: '2px solid transparent',
          backgroundColor: activeTab === tab.key ? '#1a1a1a' : 'transparent',
          color: activeTab === tab.key ? '#4a9eff' : '#e0e0e0',
          borderBottomColor: activeTab === tab.key ? '#4a9eff' : 'transparent',
        }"
        @click="switchTab(tab.key)"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </div>
    </div>

    <!-- 面板内容 -->
    <div
      class="panel-content"
      style="
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: #4a9eff #2a2a2a;
      "
    >
      <component :is="currentComponent" :key="activeTab" v-bind="componentProps" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SettingsTab from './SettingsTab.vue';
import SummaryTab from './SummaryTab.vue';
import TableTab from './TableTab.vue';
import ToolsTab from './ToolsTab.vue';

// 标签页配置
const tabs = [
  { key: 'summary', label: '历史总结', icon: 'fa-solid fa-list' },
  { key: 'table', label: '表格', icon: 'fa-solid fa-table' },
  { key: 'settings', label: '设置', icon: 'fa-solid fa-cog' },
  { key: 'tools', label: '工具模板', icon: 'fa-solid fa-tools' },
];

const activeTab = ref<'summary' | 'table' | 'settings' | 'tools'>('settings');

// 组件映射
const componentMap = {
  summary: SummaryTab,
  table: TableTab,
  settings: SettingsTab,
  tools: ToolsTab,
};

// 当前组件
const currentComponent = computed(() => componentMap[activeTab.value]);

// 组件属性
const componentProps = computed(() => ({
  activeTab: activeTab.value,
}));

// 切换标签页
const switchTab = (tabKey: string) => {
  console.log('切换标签页:', tabKey);
  activeTab.value = tabKey as any;
};

// 关闭面板
const closePanel = () => {
  $('#memoryManagementPanel').fadeOut(200);
};
</script>

<style scoped>
.memory-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  color: #e0e0e0;
}

.panel-header {
  padding: 15px 20px;
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-button {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.panel-tabs {
  display: flex;
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
}

.tab-item {
  flex: 1;
  padding: 12px 20px;
  cursor: pointer;
  text-align: center;
  transition:
    background 0.2s,
    color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tab-item.tab-active {
  background: #1a1a1a;
  color: #4a9eff;
  border-bottom-color: #4a9eff;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #4a9eff #2a2a2a;
}

.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #5ba8ff;
}

/* 确保滚动条始终显示 */
.panel-content {
  scrollbar-width: thin !important;
  scrollbar-color: #4a9eff #2a2a2a !important;
}

.panel-content::-webkit-scrollbar {
  width: 8px !important;
  display: block !important;
}

.panel-content::-webkit-scrollbar-track {
  background: #2a2a2a !important;
  border-radius: 4px !important;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #4a9eff !important;
  border-radius: 4px !important;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #5ba8ff !important;
}
</style>

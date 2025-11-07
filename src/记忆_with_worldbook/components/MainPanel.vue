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
        <b class="panel-title">{{ t('panel.title') }}</b>
        <b class="panel-title-mobile">{{ currentLocale === 'zh-CN' ? '猫猫的小破烂' : "mzrodyu's Tool" }}</b>
      </div>
      <div style="display: flex; gap: 10px; align-items: center">
        <!-- 语言切换按钮 -->
        <div
          class="language-button"
          style="
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background 0.2s;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
          "
          :title="currentLocale === 'zh-CN' ? 'Switch to English' : '切换到中文'"
          @click="toggleLanguage"
        >
          <i class="fa-solid fa-language"></i>
          <span>{{ currentLocale === 'zh-CN' ? 'EN' : '中' }}</span>
        </div>
        <div
          class="minimize-button"
          style="cursor: pointer; padding: 5px 10px; border-radius: 4px; transition: background 0.2s"
          :title="t('panel.minimize')"
          @click="minimizePanel"
        >
          <i class="fa-solid fa-minus"></i>
        </div>
        <div
          class="close-button"
          style="cursor: pointer; padding: 5px 10px; border-radius: 4px; transition: background 0.2s"
          :title="currentLocale === 'zh-CN' ? '关闭' : 'Close'"
          @click="closePanel"
        >
          <i class="fa-solid fa-times"></i>
        </div>
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
        <span class="tab-label">{{ tab.label }}</span>
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
import { useI18n } from 'vue-i18n';
import { minimizeMemoryPanel } from '../浮动面板';
import GreetingsTab from './GreetingsTab.vue';
import HelpTab from './HelpTab.vue';
import MvuBetaTab from './MvuBetaTab.vue';
import ProjectManager from './ProjectManager.vue';
import RegexUIGenerator from './RegexUIGenerator.vue';
import SettingsTab from './SettingsTab.vue';
import StatusBarGenerator from './StatusBarGenerator.vue';
import SummaryTab from './SummaryTab.vue';
import TableTab from './TableTab.vue';
import ToolsTab from './ToolsTab.vue';

const { t, locale } = useI18n();
const currentLocale = computed(() => locale.value);

// 标签页配置（使用计算属性以响应语言变化）
const tabs = computed(() => [
  { key: 'settings', label: t('tabs.settings'), icon: 'fa-solid fa-cog' },
  { key: 'summary', label: t('tabs.history'), icon: 'fa-solid fa-list' },
  { key: 'table', label: t('tabs.table'), icon: 'fa-solid fa-table' },
  { key: 'greetings', label: t('tabs.greetings'), icon: 'fa-solid fa-comments' },
  { key: 'regex', label: t('tabs.regex'), icon: 'fa-solid fa-code' },
  { key: 'status', label: t('tabs.state'), icon: 'fa-solid fa-chart-bar' },
  { key: 'project', label: t('tabs.projects'), icon: 'fa-solid fa-laptop-code' },
  { key: 'tools', label: t('tabs.tools'), icon: 'fa-solid fa-tools' },
  { key: 'mvu', label: t('tabs.mvu'), icon: 'fa-solid fa-flask' },
  { key: 'help', label: t('tabs.help'), icon: 'fa-solid fa-question-circle' },
]);

const activeTab = ref<
  'settings' | 'summary' | 'table' | 'greetings' | 'status' | 'regex' | 'project' | 'tools' | 'mvu' | 'help'
>('settings');

// 组件映射
const componentMap = {
  settings: SettingsTab,
  summary: SummaryTab,
  table: TableTab,
  greetings: GreetingsTab,
  status: StatusBarGenerator,
  regex: RegexUIGenerator,
  project: ProjectManager,
  tools: ToolsTab,
  mvu: MvuBetaTab,
  help: HelpTab,
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

// 切换语言
const toggleLanguage = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  locale.value = newLocale;
  localStorage.setItem('maomao_tool_locale', newLocale);
  toastr.success(newLocale === 'zh-CN' ? '已切换到中文' : 'Switched to English');
};

// 最小化面板
const minimizePanel = () => {
  minimizeMemoryPanel();
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

.language-button {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.language-button:hover {
  background: rgba(74, 158, 255, 0.2);
}

.minimize-button {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.minimize-button:hover {
  background: rgba(255, 255, 255, 0.1);
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

.tab-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  min-height: 0;
}

/* 自定义滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}
</style>

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import 浮动面板 from './浮动面板.vue';

$(() => {
  console.log('浮动面板.ts 开始执行');

  setTimeout(() => {
    console.log('浮动面板.ts setTimeout 回调执行');

    // 检查面板容器是否已存在
    const existingPanel = $('#memoryManagementPanel');

    if (existingPanel.length > 0) {
      console.log('mzrodyu猫猫的小破烂浮动面板已存在，强制删除并重新创建...');
      // 强制删除所有现有的面板
      existingPanel.remove();
      // 等待DOM更新
      setTimeout(() => {
        console.log('旧面板已删除，开始创建新面板...');
      }, 100);
    }

    console.log('🚀🚀🚀 开始创建面板容器 - 时间戳:', new Date().toISOString());

    // 创建面板容器 - 居中显示，固定高度
    const panelContainer = $(`
      <div id="memoryManagementPanel" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90vw;
        max-width: 1200px;
        height: 80vh;
        max-height: 80vh;
        background: #1a1a1a;
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
      </div>
    `);

    // 添加到 body
    $('body').append(panelContainer);
    console.log('面板容器已添加到 body, 容器元素:', panelContainer[0]);

    // 创建新的 Vue 应用
    console.log('准备创建新的 Vue 应用，面板容器:', panelContainer[0]);

    const app = createApp(浮动面板).use(createPinia());

    try {
      app.mount(panelContainer[0]);
      console.log('Vue 应用已成功挂载');
      console.log('Vue 实例:', (panelContainer[0] as any).__vue_app__);
    } catch (error) {
      console.error('Vue 应用挂载失败:', error);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      console.error('错误堆栈:', (error as Error).stack);
    }

    console.log('mzrodyu猫猫的小破烂浮动面板已创建，面板元素:', panelContainer[0]);
  }, 200);
});

// 打开/关闭面板的函数
export function toggleMemoryPanel() {
  const panel = $('#memoryManagementPanel');
  if (panel.length === 0) return;

  if (panel.is(':visible')) {
    panel.fadeOut(200);
  } else {
    panel.fadeIn(200);
  }
}

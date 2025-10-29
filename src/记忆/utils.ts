/**
 * 全局工具函数
 * 用于在 Vue 组件中安全地访问酒馆助手 API
 */

// 全局 script_id，在初始化时设置
let globalScriptId: string | null = null;

// 安全获取 script_id 的函数
export function getScriptIdSafe(): string | null {
  if (!globalScriptId) {
    try {
      // 尝试从全局变量获取
      if (typeof getScriptId === 'function') {
        globalScriptId = getScriptId();
      }
    } catch (e) {
      console.warn('获取 script_id 失败:', e);
    }
  }
  return globalScriptId;
}

// 设置全局 script_id
export function setGlobalScriptId(id: string) {
  globalScriptId = id;
}

// 安全获取聊天 ID
export function getChatIdSafe(): string | null {
  try {
    // 尝试使用酒馆助手的 getChatId 函数
    if (typeof (window as any).getChatId === 'function') {
      return (window as any).getChatId();
    }
    // 如果 getChatId 不可用，尝试其他方法
    if (typeof (window as any).SillyTavern !== 'undefined' && (window as any).SillyTavern.getCurrentChatId) {
      return (window as any).SillyTavern.getCurrentChatId();
    }
  } catch (e) {
    console.warn('获取 chat_id 失败:', e);
  }
  return null;
}

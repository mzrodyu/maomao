import { klona } from 'klona';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { getChatIdSafe, getScriptIdSafe } from './utils';

// 安全导入 zod
let z: any;
try {
  z = require('zod');
} catch (e) {
  console.warn('zod 不可用，使用备用方案');
  // 简单的备用验证函数
  z = {
    object: (obj: any) => ({
      parse: (data: any) => data,
      default: (def: any) => ({ parse: (data: any) => data || def }),
    }),
    string: () => ({ default: (def: string) => ({ parse: (data: any) => data || def }) }),
    number: () => ({ default: (def: number) => ({ parse: (data: any) => data || def }) }),
    boolean: () => ({ default: (def: boolean) => ({ parse: (data: any) => data || def }) }),
    array: (schema: any) => ({
      default: (def: any[]) => ({ parse: (data: any) => (Array.isArray(data) ? data : def) }),
    }),
    prefault: (def: any) => ({ parse: (data: any) => data || def }),
  };
}

const Settings = z
  .object({
    api_endpoint: z.string().default('https://api.openai.com/v1/chat/completions'),
    api_key: z.string().default(''),
    model: z.string().default('gpt-4o-mini'),
    max_tokens: z.number().default(4000),
    temperature: z.number().default(0.7),
    auto_summarize_enabled: z.boolean().default(false),
    summarize_interval: z.number().default(50), // 每多少楼层自动总结一次
    start_message_id: z.number().default(0), // 开始总结的楼层
    end_message_id: z.number().default(0), // 结束总结的楼层
    table_start_message_id: z.number().default(0), // 开始生成表格的楼层
    table_end_message_id: z.number().default(0), // 结束生成表格的楼层
    summary_history: z
      .array(
        z.object({
          start_id: z.number(),
          end_id: z.number(),
          content: z.string(),
        }),
      )
      .default([]),
  })
  .prefault({});

export const useSettingsStore = defineStore('settings', () => {
  // 使用全局的安全获取函数
  const getScriptIdSafely = () => getScriptIdSafe();

  // 初始化设置
  const initSettings = () => {
    const script_id = getScriptIdSafely();

    if (!script_id) {
      console.warn('script_id 为 null，使用默认设置');
      return ref(Settings.parse({}));
    }

    try {
      return ref(Settings.parse(getVariables({ type: 'script', script_id })));
    } catch (e) {
      console.warn('读取变量失败，使用默认设置:', e);
      return ref(Settings.parse({}));
    }
  };

  const settings = initSettings();

  // 在初始化后尝试读取真实变量
  setTimeout(() => {
    const script_id = getScriptIdSafely();
    if (script_id) {
      try {
        const realVariables = getVariables({ type: 'script', script_id });
        if (realVariables && Object.keys(realVariables).length > 0) {
          settings.value = Settings.parse(realVariables);
        }
      } catch (e) {
        console.warn('读取真实变量失败，使用初始值:', e);
      }
    }
  }, 200);

  // 防抖保存设置，避免频繁保存
  let saveTimeout: number | null = null;
  const debouncedSave = (new_settings: any) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      const script_id = getScriptIdSafely();
      if (!script_id) {
        console.warn('无法保存设置，script_id 为 null');
        return;
      }
      try {
        console.log('💾 保存设置到酒馆变量:', new_settings);
        insertOrAssignVariables(klona(new_settings), { type: 'script', script_id });

        // 验证保存是否成功
        setTimeout(() => {
          try {
            const saved = getVariables({ type: 'script', script_id });
            console.log('✅ 设置保存验证成功:', saved);
          } catch (e) {
            console.error('❌ 设置保存验证失败:', e);
          }
        }, 100);
      } catch (e) {
        console.error('❌ 保存设置失败:', e);
        window.toastr?.error('设置保存失败: ' + (e as Error).message);
      }
    }, 500); // 500ms 防抖
  };

  watch(settings, debouncedSave, { immediate: false, deep: true });

  // 手动保存设置函数
  const saveSettings = () => {
    const script_id = getScriptIdSafely();
    if (!script_id) {
      console.warn('无法保存设置，script_id 为 null');
      window.toastr?.error('无法保存设置：script_id 为空');
      return false;
    }
    try {
      console.log('💾 手动保存设置:', settings.value);
      insertOrAssignVariables(klona(settings.value), { type: 'script', script_id });
      window.toastr?.success('设置已保存');
      return true;
    } catch (e) {
      console.error('❌ 手动保存设置失败:', e);
      window.toastr?.error('设置保存失败: ' + (e as Error).message);
      return false;
    }
  };

  // 重新加载设置函数
  const reloadSettings = () => {
    const script_id = getScriptIdSafely();
    if (!script_id) {
      console.warn('无法重新加载设置，script_id 为 null');
      return false;
    }
    try {
      const realVariables = getVariables({ type: 'script', script_id });
      if (realVariables && Object.keys(realVariables).length > 0) {
        settings.value = Settings.parse(realVariables);
        console.log('✅ 设置重新加载成功:', settings.value);
        window.toastr?.success('设置已重新加载');
        return true;
      }
    } catch (e) {
      console.error('❌ 重新加载设置失败:', e);
      window.toastr?.error('设置重新加载失败: ' + (e as Error).message);
    }
    return false;
  };

  return {
    settings,
    saveSettings,
    reloadSettings,
  };
});

// 历史总结 Store - 简化版本
export const useSummaryHistoryStore = defineStore('summaryHistory', () => {
  const addSummary = (start_id: number, end_id: number, content: string) => {
    try {
      // 获取当前聊天 ID
      const chat_id = getChatIdSafe();
      if (!chat_id) {
        console.error('无法获取聊天 ID');
        window.toastr.error('无法获取当前聊天信息');
        return;
      }

      console.log('添加总结到聊天:', chat_id);

      // 从聊天变量中读取总结历史
      let chatHistory: Array<{ start_id: number; end_id: number; content: string }> = [];
      try {
        const chatData = getVariables({ type: 'chat' });
        if (chatData && chatData.summary_history) {
          chatHistory = Array.isArray(chatData.summary_history) ? chatData.summary_history : [];
        }
      } catch (e) {
        console.warn('读取聊天总结历史失败:', e);
      }

      // 添加新的总结
      chatHistory.unshift({
        start_id,
        end_id,
        content,
      });

      // 保留最近 50 条历史
      if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(0, 50);
      }

      // 保存到聊天变量
      insertOrAssignVariables({ summary_history: chatHistory }, { type: 'chat' });

      console.log('总结已保存到聊天变量:', chat_id);
    } catch (error) {
      console.error('保存总结失败:', error);
      window.toastr.error('保存总结失败: ' + (error as Error).message);
    }
  };

  const getSummaryHistory = (): Array<{ start_id: number; end_id: number; content: string }> => {
    try {
      const chat_id = getChatIdSafe();
      if (!chat_id) {
        return [];
      }

      const chatData = getVariables({ type: 'chat' });
      if (chatData && chatData.summary_history) {
        return Array.isArray(chatData.summary_history) ? chatData.summary_history : [];
      }
      return [];
    } catch (e) {
      console.warn('读取聊天总结历史失败:', e);
      return [];
    }
  };

  return {
    addSummary,
    getSummaryHistory,
  };
});

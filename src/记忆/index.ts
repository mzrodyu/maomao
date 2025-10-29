import { watch } from 'vue';
import { useSettingsStore, useSummaryHistoryStore } from './settings';
import { getScriptIdSafe, setGlobalScriptId } from './utils';
import { summarizeMessages } from './总结功能';
import './浮动面板';
import './添加导航按钮';

$(() => {
  // 延迟初始化，确保酒馆助手完全加载
  setTimeout(() => {
    let script_id: string | null = null;
    try {
      script_id = getScriptId?.();
    } catch (e) {
      console.error('无法获取 script_id:', e);
    }

    if (!script_id) {
      console.error('无法获取 script_id，mzrodyu猫猫的小破烂脚本无法正常工作');
      window.toastr.error('mzrodyu猫猫的小破烂脚本初始化失败');
      return;
    }

    // 设置全局 script_id
    setGlobalScriptId(script_id);

    console.log('mzrodyu猫猫的小破烂脚本开始初始化，script_id:', script_id);

    // 等待一段时间确保完全准备好
    setTimeout(() => {
      // 监听消息变化，实现自动总结
      const checkAutoSummarize = () => {
        try {
          console.log('🔍 开始检查自动总结...');

          const store = useSettingsStore();
          if (!store || !store.settings) {
            console.warn('❌ 无法获取设置，跳过自动总结检查');
            return;
          }

          const settings = store.settings;

          // 验证设置完整性
          if (typeof settings.auto_summarize_enabled !== 'boolean') {
            console.warn('❌ 自动总结设置无效，跳过检查');
            return;
          }

          if (typeof settings.summarize_interval !== 'number' || settings.summarize_interval < 1) {
            console.warn('❌ 总结间隔设置无效，跳过检查');
            return;
          }
          console.log('📋 当前设置:', {
            auto_summarize_enabled: settings.auto_summarize_enabled,
            summarize_interval: settings.summarize_interval,
            has_api_key: !!settings.api_key,
          });

          if (!settings.auto_summarize_enabled) {
            console.log('⏸️ 自动总结未启用');
            return;
          }

          if (!settings.api_key) {
            console.log('❌ API Key 未设置');
            return;
          }

          const last_message_id = getLastMessageId();

          // 获取当前聊天ID
          const current_chat_id = SillyTavern.getCurrentChatId();
          if (!current_chat_id) {
            console.log('❌ 无法获取聊天ID，跳过自动总结检查');
            return;
          }

          // 获取自动总结开启时的起始楼层（基于聊天ID）
          let auto_summary_start_id = 0;
          try {
            // 根据酒馆助手文档，使用聊天变量存储每个聊天的状态
            const chatVars = getVariables({ type: 'chat' });
            const auto_summary_start_id_key = 'auto_summary_start_id';

            console.log(`🔍 检查聊天变量:`, {
              current_chat_id,
              chat_vars: chatVars,
              has_start_id: chatVars[auto_summary_start_id_key] !== undefined,
              existing_start_id: chatVars[auto_summary_start_id_key],
            });

            if (chatVars[auto_summary_start_id_key] !== undefined && chatVars[auto_summary_start_id_key] !== null) {
              auto_summary_start_id = chatVars[auto_summary_start_id_key];
              console.log(`✅ 使用现有起始楼层: ${auto_summary_start_id} (聊天: ${current_chat_id})`);
            } else {
              // 当前聊天没有起始楼层，需要智能设置
              // 检查是否有现有的总结历史，避免重复总结
              const scriptId = getScriptIdSafe();
              if (!scriptId) {
                console.warn('script_id 为空，无法检查现有总结');
                return;
              }
              const scriptVars = getVariables({ type: 'script', script_id: scriptId });
              const existingSummaries = Array.isArray(scriptVars?.summary_history) ? scriptVars.summary_history : [];

              if (existingSummaries.length > 0) {
                // 有现有总结，找到最后一个总结的结束楼层
                const lastSummary = existingSummaries[0]; // 最新的总结在数组开头
                const lastSummaryEnd = lastSummary.end_id || 0;

                // 如果当前楼层大于最后总结的结束楼层，从最后总结结束楼层+1开始
                if (last_message_id > lastSummaryEnd) {
                  auto_summary_start_id = lastSummaryEnd + 1;
                  console.log(
                    `🔄 重新加载聊天，基于现有总结设置起始楼层: ${auto_summary_start_id} (最后总结结束于第 ${lastSummaryEnd} 层)`,
                  );
                  window.toastr?.info(`重新加载聊天，起始楼层设置为第 ${auto_summary_start_id} 层`);
                } else {
                  // 当前楼层小于等于最后总结结束楼层，从当前楼层开始
                  auto_summary_start_id = last_message_id;
                  console.log(`🔄 重新加载聊天，当前楼层已总结，从当前楼层开始: ${last_message_id}`);
                  window.toastr?.info(`重新加载聊天，从当前楼层开始: ${last_message_id}`);
                }
              } else {
                // 没有现有总结，从第0层开始（包括AI开场白）
                auto_summary_start_id = 0;
                console.log(`🆕 新聊天窗口，设置起始楼层: 0 (聊天: ${current_chat_id}) - 从AI开场白开始`);
                window.toastr?.info(`新聊天窗口，起始楼层设置为第 0 层（AI开场白）`);
              }

              // 确保起始楼层从第0层开始（包括AI开场白）
              if (auto_summary_start_id < 0) {
                auto_summary_start_id = 0;
                console.log(`⚠️ 修正起始楼层为0，从AI开场白开始`);
              }

              // 保存起始楼层到聊天变量（根据酒馆助手文档）
              insertOrAssignVariables({ [auto_summary_start_id_key]: auto_summary_start_id }, { type: 'chat' });
            }
          } catch (error) {
            console.warn('获取自动总结起始楼层失败，使用当前楼层:', error);
            auto_summary_start_id = last_message_id;
          }

          console.log(
            `检查自动总结: 当前楼层=${last_message_id}, 起始楼层=${auto_summary_start_id}, 间隔=${settings.summarize_interval}`,
          );

          // 检查是否需要自动总结
          // 修正计算逻辑：从起始楼层开始计算相对位置，包含起始楼层
          // 楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...
          const relative_position = last_message_id - auto_summary_start_id;

          // 修复：间隔为5表示每5层总结一次（0-4, 5-9...）
          // 从楼层0到楼层4共5层，relative_position=4，所以触发条件是 >= interval - 1
          const should_trigger = relative_position >= settings.summarize_interval - 1;

          console.log('🧮 计算检查:', {
            last_message_id,
            auto_summary_start_id,
            relative_position,
            summarize_interval: settings.summarize_interval,
            should_trigger,
            calculation: `${relative_position} >= ${settings.summarize_interval - 1} (包含起始楼层，共${relative_position + 1}层)`,
            expected_trigger_at_floor: auto_summary_start_id + settings.summarize_interval - 1,
            will_summarize_range: `${auto_summary_start_id}-${auto_summary_start_id + settings.summarize_interval - 1}`,
            floor_explanation: '楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...',
          });

          if (last_message_id >= auto_summary_start_id && should_trigger) {
            // 计算总结范围：固定总结interval层（例如间隔5就总结5层）
            const start_id = auto_summary_start_id;
            const end_id = auto_summary_start_id + settings.summarize_interval - 1;

            // 异步执行总结
            console.log(`🎯 触发自动总结: 楼层 ${start_id}-${end_id}`);
            window.toastr.info(`🔄 开始自动总结楼层 ${start_id}-${end_id}...`);

            summarizeMessages(start_id, end_id)
              .then(summary => {
                console.log(`✅ 自动总结完成: 楼层 ${start_id}-${end_id}`, summary);

                // 添加到历史总结中
                try {
                  const historyStore = useSummaryHistoryStore();
                  historyStore.addSummary(start_id, end_id, summary);
                } catch (e) {
                  console.error('添加自动总结到历史失败:', e);
                }

                // 更新起始楼层，为下次总结做准备
                const new_start_id = end_id + 1;
                insertOrAssignVariables({ auto_summary_start_id: new_start_id }, { type: 'chat' });
                console.log(`🔄 更新起始楼层为: ${new_start_id}`);

                window.toastr.success(`✅ 已自动总结第 ${start_id}-${end_id} 楼，下次将从第 ${new_start_id} 楼开始`);
              })
              .catch(error => {
                console.error('❌ 自动总结失败：', error);
                window.toastr.error('❌ 自动总结失败：' + error.message);
              });
          }
        } catch (error) {
          console.error('checkAutoSummarize 发生错误：', error);
          // 静默失败，不影响用户操作
        }
      };

      // 监听消息接收事件
      try {
        eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, () => {
          console.log('📨 收到消息渲染事件，检查自动总结...');
          checkAutoSummarize();
        });

        // 监听聊天切换事件（根据酒馆助手文档）
        eventOn(tavern_events.CHAT_CHANGED, (chat_file_name: string) => {
          console.log('🔄 聊天切换事件:', chat_file_name);

          // 检查新聊天是否已有自动总结状态
          try {
            const chatVars = getVariables({ type: 'chat' });
            const auto_summary_start_id = chatVars.auto_summary_start_id;

            if (auto_summary_start_id !== undefined && auto_summary_start_id !== null) {
              console.log(`✅ 切换到已有自动总结的聊天: ${chat_file_name}, 起始楼层: ${auto_summary_start_id}`);
            } else {
              console.log(`🆕 切换到新聊天: ${chat_file_name}, 等待下一条消息时初始化`);
            }
          } catch (error) {
            console.warn('检查聊天状态失败:', error);
          }
        });

        console.log('✅ 事件监听器已注册');

        // 添加全局调试函数 - 与测试函数保持一致
        (window as any).testCompleteAutoSummary = () => {
          try {
            console.log('🧪 测试完整的自动总结流程...');

            // 1. 检查当前状态
            const last_message_id = getLastMessageId();
            const current_floor = last_message_id;

            console.log('当前楼层:', current_floor);

            // 2. 检查保存的起始楼层（使用酒馆助手变量系统）
            const chatVars = getVariables({ type: 'chat' });
            const saved_start_id = chatVars.auto_summary_start_id;
            console.log('保存的起始楼层:', saved_start_id);

            // 3. 检查保存的总结数据
            const scriptId = getScriptIdSafe();
            if (!scriptId) {
              console.warn('script_id 为空，无法检查保存的总结数据');
              return;
            }
            const scriptVars = getVariables({ type: 'script', script_id: scriptId });
            const saved_summary = scriptVars?.summary_history?.[0];
            if (saved_summary) {
              console.log('保存的总结数据:', saved_summary);
            }

            // 4. 测试下次触发条件
            const start_id = parseInt(saved_start_id) || 0;
            const summarize_interval = 5;
            const relative_position = current_floor - start_id;
            const should_trigger =
              relative_position >= summarize_interval - 1 &&
              relative_position % summarize_interval === summarize_interval - 1;

            console.log('触发条件测试:', {
              current_floor,
              start_id,
              relative_position,
              summarize_interval,
              should_trigger,
              next_trigger_floor: start_id + summarize_interval - 1,
              floor_explanation: '楼层编号：0=AI开场白, 1=用户, 2=AI, 3=用户...',
            });

            // 5. 显示总结历史
            console.log('总结历史:', scriptVars?.summary_history);

            console.log('✅ 自动总结功能测试完成');
          } catch (error) {
            console.error('❌ 测试失败:', error);
          }
        };

        (window as any).checkCurrentFloor = () => {
          try {
            const last_message_id = getLastMessageId();
            const chatVars = getVariables({ type: 'chat' });
            const auto_summary_start_id = chatVars.auto_summary_start_id || 0;
            const summarize_interval = 5;

            const relative_position = last_message_id - auto_summary_start_id;
            const should_trigger =
              relative_position >= summarize_interval - 1 &&
              relative_position % summarize_interval === summarize_interval - 1;

            console.log('🔍 当前楼层检查:', {
              last_message_id,
              auto_summary_start_id,
              relative_position,
              summarize_interval,
              should_trigger,
              calculation: `${relative_position} >= ${summarize_interval - 1} && (${relative_position} + 1) % ${summarize_interval} = ${(relative_position + 1) % summarize_interval}`,
            });

            window.toastr?.info(`当前楼层${last_message_id}: 相对位置=${relative_position}, 触发=${should_trigger}`);
          } catch (error) {
            console.error('❌ 当前楼层检查失败:', error);
            window.toastr?.error('检查失败: ' + (error as Error).message);
          }
        };

        (window as any).testFloorCalculation = () => {
          try {
            const last_message_id = getLastMessageId();
            const chatVars = getVariables({ type: 'chat' });
            const auto_summary_start_id = chatVars.auto_summary_start_id || 0;
            const summarize_interval = 5;

            console.log('🧮 楼层计算验证:', {
              last_message_id,
              auto_summary_start_id,
              summarize_interval,
            });

            // 测试不同楼层的计算
            console.log('楼层编号说明：0=AI开场白, 1=用户, 2=AI, 3=用户...');
            for (let floor = 0; floor <= 15; floor++) {
              const relative_position = floor - auto_summary_start_id;
              const should_trigger =
                relative_position >= summarize_interval - 1 && (relative_position + 1) % summarize_interval === 0;
              const start_id = auto_summary_start_id;
              const end_id = floor;

              const floorType = floor === 0 ? 'AI开场白' : floor % 2 === 1 ? '用户' : 'AI';

              console.log(
                `楼层 ${floor}(${floorType}): 相对位置=${relative_position}, 触发=${should_trigger}, 总结范围=${start_id}-${end_id}, 计算=${relative_position} % ${summarize_interval} = ${relative_position % summarize_interval} (期望: ${summarize_interval - 1})`,
              );
            }

            window.toastr?.info('楼层计算验证完成，请查看控制台');
          } catch (error) {
            console.error('❌ 楼层计算验证失败:', error);
            window.toastr?.error('验证失败: ' + (error as Error).message);
          }
        };

        console.log('✅ 调试函数已注册');

        // 自动检测并处理老窗口
        setTimeout(() => {
          (window as any).autoDetectOldWindow();
        }, 1000); // 延迟1秒执行，确保酒馆完全加载
      } catch (error) {
        console.error('❌ 注册事件监听器失败:', error);
      }

      // 添加手动测试函数到全局，方便调试
      (window as any).testAutoSummarize = checkAutoSummarize;

      // 添加同步localStorage和酒馆助手变量的函数
      (window as any).syncAutoSummaryData = () => {
        try {
          console.log('🔄 开始同步自动总结数据...');

          // 从localStorage读取数据
          const saved_start_id = localStorage.getItem('auto_summary_start_id');
          const saved_summary = localStorage.getItem('last_summary');

          console.log('localStorage数据:', {
            saved_start_id,
            saved_summary: saved_summary ? JSON.parse(saved_summary) : null,
          });

          if (saved_start_id) {
            // 同步起始楼层到酒馆助手聊天变量
            insertOrAssignVariables({ auto_summary_start_id: parseInt(saved_start_id) }, { type: 'chat' });
            console.log(`✅ 已同步起始楼层: ${saved_start_id}`);
          }

          if (saved_summary) {
            try {
              const summaryData = JSON.parse(saved_summary);
              const scriptId = getScriptIdSafe();
              if (!scriptId) {
                console.warn('script_id 为空，无法处理总结数据');
                return;
              }
              const scriptVars = getVariables({ type: 'script', script_id: scriptId });
              const existingSummaries = scriptVars?.summary_history || [];

              // 检查是否已存在相同的总结
              const exists = existingSummaries.some(
                (s: any) => s.start_id === summaryData.start_id && s.end_id === summaryData.end_id,
              );

              if (!exists) {
                // 添加总结到历史记录
                const newSummary = {
                  start_id: summaryData.start_id,
                  end_id: summaryData.end_id,
                  content: summaryData.summary,
                  timestamp: summaryData.timestamp,
                };

                const updatedSummaries = [newSummary, ...existingSummaries];
                insertOrAssignVariables({ summary_history: updatedSummaries }, { type: 'script', script_id: scriptId });
                console.log(`✅ 已同步总结数据: 楼层 ${summaryData.start_id}-${summaryData.end_id}`);
              } else {
                console.log(`⚠️ 总结数据已存在，跳过同步`);
              }
            } catch (e) {
              console.error('解析总结数据失败:', e);
            }
          }

          window.toastr?.success('数据同步完成');
          console.log('✅ 自动总结数据同步完成');
        } catch (error) {
          console.error('❌ 同步数据失败:', error);
          window.toastr?.error('同步失败: ' + (error as Error).message);
        }
      };

      // 自动检测并处理老窗口（根据酒馆助手文档）
      (window as any).autoDetectOldWindow = () => {
        try {
          const current_chat_id = SillyTavern.getCurrentChatId();
          const last_message_id = getLastMessageId();
          const chatVars = getVariables({ type: 'chat' });

          // 如果当前聊天没有自动总结状态，且楼层数较多，说明是老窗口
          if (
            (chatVars.auto_summary_start_id === undefined || chatVars.auto_summary_start_id === null) &&
            last_message_id > 0
          ) {
            console.log(`🔍 检测到老窗口: 聊天ID=${current_chat_id}, 楼层数=${last_message_id}`);
            return (window as any).handleOldWindow();
          } else {
            console.log(`✅ 当前聊天状态正常: 聊天ID=${current_chat_id}, 楼层数=${last_message_id}`);
            return null;
          }
        } catch (error) {
          console.error('❌ 自动检测老窗口失败:', error);
          return null;
        }
      };

      // 添加智能重置聊天状态函数（根据酒馆助手文档，使用聊天变量）
      (window as any).smartResetChat = () => {
        try {
          // 删除当前聊天的自动总结起始楼层（聊天变量）
          insertOrAssignVariables({ auto_summary_start_id: null }, { type: 'chat' });

          console.log('🔄 已重置当前聊天状态，下次消息时将重新智能设置');
          window.toastr?.success('已重置当前聊天状态');
        } catch (error) {
          console.error('❌ 重置聊天状态失败:', error);
          window.toastr?.error('重置失败: ' + (error as Error).message);
        }
      };

      // 添加修复起始楼层的函数
      (window as any).fixStartId = () => {
        try {
          const current_chat_id = SillyTavern.getCurrentChatId();
          const last_message_id = getLastMessageId();
          const chatVars = getVariables({ type: 'chat' });
          const current_start_id = chatVars.auto_summary_start_id;

          console.log('🔧 修复起始楼层:', {
            current_chat_id,
            last_message_id,
            current_start_id,
          });

          // 如果起始楼层为0或未设置，设置为当前楼层
          if (current_start_id === 0 || current_start_id === undefined || current_start_id === null) {
            const new_start_id = last_message_id;
            insertOrAssignVariables({ auto_summary_start_id: new_start_id }, { type: 'chat' });
            console.log(`✅ 已修复起始楼层: ${new_start_id}`);
            window.toastr?.success(`已修复起始楼层: ${new_start_id}`);
          } else {
            console.log(`✅ 起始楼层正常: ${current_start_id}`);
            window.toastr?.info(`起始楼层正常: ${current_start_id}`);
          }
        } catch (error) {
          console.error('❌ 修复起始楼层失败:', error);
          window.toastr?.error('修复失败: ' + (error as Error).message);
        }
      };

      // 添加检查MemoryUI冲突的函数
      (window as any).checkMemoryUIConflict = () => {
        try {
          const memoryUI = (window as any).MemoryUI;
          const ourSettings = useSettingsStore();

          console.log('🔍 检查MemoryUI冲突:', {
            memoryUI_exists: !!memoryUI,
            memoryUI_autoSummarizeEnabled: memoryUI?.autoSummarizeEnabled,
            our_auto_summarize_enabled: ourSettings.settings.auto_summarize_enabled,
            our_summarize_interval: ourSettings.settings.summarize_interval,
          });

          if (memoryUI && memoryUI.autoSummarizeEnabled !== undefined) {
            console.log('⚠️ 检测到MemoryUI插件，可能存在冲突');
            window.toastr?.warning('检测到MemoryUI插件，建议关闭其自动总结功能以避免冲突');
          } else {
            console.log('✅ 未检测到MemoryUI冲突');
            window.toastr?.info('未检测到MemoryUI冲突');
          }
        } catch (error) {
          console.error('❌ 检查MemoryUI冲突失败:', error);
          window.toastr?.error('检查失败: ' + (error as Error).message);
        }
      };

      // 添加楼层计算验证函数
      (window as any).testFloorCalculation = () => {
        try {
          const last_message_id = getLastMessageId();
          const chatVars = getVariables({ type: 'chat' });
          const auto_summary_start_id = chatVars.auto_summary_start_id || 0;
          const summarize_interval = 5;

          console.log('🧮 楼层计算验证:', {
            last_message_id,
            auto_summary_start_id,
            summarize_interval,
          });

          // 测试不同楼层的计算
          for (let floor = 0; floor <= 15; floor++) {
            const relative_position = floor - auto_summary_start_id;
            const should_trigger =
              relative_position >= summarize_interval - 1 &&
              relative_position % summarize_interval === summarize_interval - 1;
            const start_id = auto_summary_start_id;
            const end_id = floor;

            console.log(
              `楼层 ${floor}: 相对位置=${relative_position}, 触发=${should_trigger}, 总结范围=${start_id}-${end_id}`,
            );
          }

          window.toastr?.info('楼层计算验证完成，请查看控制台');
        } catch (error) {
          console.error('❌ 楼层计算验证失败:', error);
          window.toastr?.error('验证失败: ' + (error as Error).message);
        }
      };

      // 添加重置起始楼层函数
      (window as any).resetAutoSummaryStart = () => {
        try {
          const scriptId = getScriptId();
          const current_chat_id = SillyTavern.getCurrentChatId();
          const last_message_id = getLastMessageId();

          if (!current_chat_id) {
            window.toastr?.error('无法获取聊天ID');
            return;
          }

          const scriptVars = getVariables({ type: 'script', script_id: scriptId });
          const auto_summary_data = scriptVars.auto_summary_data || {};
          auto_summary_data[current_chat_id] = last_message_id;

          insertOrAssignVariables({ auto_summary_data: auto_summary_data }, { type: 'script', script_id: scriptId });
          console.log(`✅ 手动重置起始楼层为: ${last_message_id} (聊天: ${current_chat_id})`);
          window.toastr?.success(`起始楼层已重置为第 ${last_message_id} 层`);
        } catch (error) {
          console.error('❌ 重置起始楼层失败:', error);
          window.toastr?.error('重置失败: ' + (error as Error).message);
        }
      };

      // 添加清理当前聊天数据的函数（根据酒馆助手文档，使用聊天变量）
      (window as any).clearCurrentChatData = () => {
        try {
          // 清理当前聊天的自动总结起始楼层
          insertOrAssignVariables({ auto_summary_start_id: null }, { type: 'chat' });
          console.log('🗑️ 已清理当前聊天数据');
          window.toastr?.success('当前聊天数据已清理');
        } catch (error) {
          console.error('❌ 清理聊天数据失败:', error);
          window.toastr?.error('清理失败: ' + (error as Error).message);
        }
      };

      // 添加查看聊天ID变化的函数
      (window as any).watchChatId = () => {
        let lastChatId = SillyTavern.getCurrentChatId();
        console.log('🔍 开始监控聊天ID变化，当前ID:', lastChatId);

        const checkChatId = () => {
          const currentChatId = SillyTavern.getCurrentChatId();
          if (currentChatId !== lastChatId) {
            console.log('🔄 聊天ID变化:', lastChatId, '->', currentChatId);
            lastChatId = currentChatId;
          }
        };

        // 每秒检查一次
        const interval = setInterval(checkChatId, 1000);

        // 返回停止监控的函数
        return () => {
          clearInterval(interval);
          console.log('⏹️ 停止监控聊天ID变化');
        };
      };

      // 添加查看当前聊天数据的函数（根据酒馆助手文档，使用聊天变量）
      (window as any).showCurrentChatData = () => {
        try {
          const current_chat_id = SillyTavern.getCurrentChatId();
          const chatVars = getVariables({ type: 'chat' });

          console.log('📊 当前聊天数据:', {
            current_chat_id,
            chat_vars: chatVars,
            auto_summary_start_id: chatVars.auto_summary_start_id,
          });

          window.toastr?.info(`已输出当前聊天数据到控制台，聊天ID: ${current_chat_id}`);
          return chatVars;
        } catch (error) {
          console.error('❌ 查看聊天数据失败:', error);
          window.toastr?.error('查看失败: ' + (error as Error).message);
          return null;
        }
      };

      // 添加处理老窗口的函数（根据酒馆助手文档）
      (window as any).handleOldWindow = () => {
        try {
          const current_chat_id = SillyTavern.getCurrentChatId();
          const last_message_id = getLastMessageId();
          const chatVars = getVariables({ type: 'chat' });
          const scriptId = getScriptId();
          const scriptVars = getVariables({ type: 'script', script_id: scriptId });
          const existingSummaries = scriptVars?.summary_history || [];

          console.log('🔍 老窗口分析:', {
            current_chat_id,
            last_message_id,
            chat_has_start_id: chatVars.auto_summary_start_id !== undefined,
            existing_summaries_count: existingSummaries.length,
            last_summary_end: existingSummaries.length > 0 ? existingSummaries[0].end_id : 'none',
          });

          // 如果当前聊天没有起始楼层，智能设置
          if (chatVars.auto_summary_start_id === undefined || chatVars.auto_summary_start_id === null) {
            let auto_summary_start_id = last_message_id;

            if (existingSummaries.length > 0) {
              const lastSummary = existingSummaries[0];
              const lastSummaryEnd = lastSummary.end_id || 0;

              if (last_message_id > lastSummaryEnd) {
                auto_summary_start_id = lastSummaryEnd + 1;
                console.log(
                  `🔄 老窗口智能设置: 从第 ${auto_summary_start_id} 层开始 (最后总结结束于第 ${lastSummaryEnd} 层)`,
                );
              } else {
                console.log(`🔄 老窗口智能设置: 从当前楼层开始 ${last_message_id} (当前楼层已总结)`);
              }
            } else {
              console.log(`🆕 老窗口智能设置: 从当前楼层开始 ${last_message_id} (无现有总结)`);
            }

            // 保存到聊天变量
            insertOrAssignVariables({ auto_summary_start_id: auto_summary_start_id }, { type: 'chat' });

            window.toastr?.info(`老窗口已初始化，起始楼层: ${auto_summary_start_id}`);
          } else {
            console.log(`✅ 老窗口已有起始楼层: ${chatVars.auto_summary_start_id}`);
            window.toastr?.info(`老窗口已有起始楼层: ${chatVars.auto_summary_start_id}`);
          }

          return {
            chat_id: current_chat_id,
            last_message_id,
            auto_summary_start_id: chatVars.auto_summary_start_id,
            existing_summaries: existingSummaries.length,
          };
        } catch (error) {
          console.error('❌ 处理老窗口失败:', error);
          window.toastr?.error('处理失败: ' + (error as Error).message);
          return null;
        }
      };

      // 添加调试状态查看函数
      (window as any).checkAutoSummaryStatus = () => {
        try {
          const store = useSettingsStore();
          if (!store || !store.settings) {
            console.warn('❌ 无法获取设置');
            return null;
          }

          const settings = store.settings;
          const scriptId = getScriptId();
          const current_chat_id = SillyTavern.getCurrentChatId();
          const scriptVars = getVariables({ type: 'script', script_id: scriptId });
          const last_message_id = getLastMessageId();
          const auto_summary_data = scriptVars.auto_summary_data || {};
          const auto_summary_start_id = auto_summary_data[current_chat_id] || 0;
          const relative_position = last_message_id - auto_summary_start_id + 1;
          const should_trigger = relative_position % settings.summarize_interval === 0;

          const status = {
            current_chat_id,
            last_message_id,
            auto_summary_start_id,
            relative_position,
            summarize_interval: settings.summarize_interval,
            should_trigger,
            calculation: `${relative_position} % ${settings.summarize_interval} = ${relative_position % settings.summarize_interval}`,
            auto_summarize_enabled: settings.auto_summarize_enabled,
            api_key_set: !!settings.api_key,
            all_chat_data: auto_summary_data,
          };

          console.log('🔍 自动总结状态:', status);
          window.toastr?.info(`状态已输出到控制台`);
          return status;
        } catch (error) {
          console.error('❌ 检查状态失败:', error);
          window.toastr?.error('检查失败: ' + (error as Error).message);
          return null;
        }
      };

      // 添加设置监控，当设置变化时重新验证
      const settingsStore = useSettingsStore();
      if (settingsStore && settingsStore.settings) {
        // 监听设置变化，确保自动总结状态正确
        const unwatch = watch(
          () => settingsStore.settings.auto_summarize_enabled,
          (newValue, oldValue) => {
            console.log(`🔄 自动总结设置变化: ${oldValue} -> ${newValue}`);
            if (newValue && !oldValue) {
              // 开启自动总结时，检查是否需要设置起始楼层
              try {
                const scriptId = getScriptIdSafe();
                if (!scriptId) {
                  console.warn('script_id 为空，无法检查起始楼层');
                  return;
                }
                const scriptVars = getVariables({ type: 'script', script_id: scriptId });
                const auto_summary_start_id = scriptVars.auto_summary_start_id;

                // 只有在没有设置过起始楼层时才设置
                if (auto_summary_start_id === undefined || auto_summary_start_id === null) {
                  const last_message_id = getLastMessageId();
                  insertOrAssignVariables(
                    { auto_summary_start_id: last_message_id },
                    { type: 'script', script_id: scriptId },
                  );
                  console.log(`✅ 首次开启自动总结，起始楼层设置为: ${last_message_id}`);
                  window.toastr?.info(`自动总结已开启，将从第 ${last_message_id} 层开始`);
                } else {
                  console.log(`✅ 自动总结已开启，使用现有起始楼层: ${auto_summary_start_id}`);
                  window.toastr?.info(`自动总结已开启，起始楼层: ${auto_summary_start_id}`);
                }
              } catch (error) {
                console.error('❌ 检查起始楼层失败:', error);
              }
            }
          },
          { immediate: false },
        );

        // 页面卸载时清理监听器
        $(window).on('pagehide', () => {
          unwatch();
        });
      }

      window.toastr.success('mzrodyu猫猫的小破烂脚本已加载');
    }, 200);
  }, 100);
});

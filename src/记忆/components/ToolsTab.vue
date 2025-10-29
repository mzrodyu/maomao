<template>
  <div class="tools-tab" style="padding: 25px !important; background: #1a1a1a !important">
    <!-- 反八股工具 -->
    <div class="tool-section">
      <div class="section-header" @click="toggleToolExpanded('antiCliche')">
        <h4 style="margin: 0; color: #fff; font-size: 16px; font-weight: 600">
          <i class="fa-solid fa-broom" style="margin-right: 8px; color: #ff6b6b"></i>
          反八股工具
        </h4>
        <i
          :class="isToolExpanded('antiCliche') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease"
        ></i>
      </div>

      <div v-if="isToolExpanded('antiCliche')" class="tool-content">
        <div class="tool-instructions">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #17a2b8"></i>
            角色卡/世界书/开场白八股清理工具，系统化执行9个步骤，清除200+禁用词。
          </p>
          <p
            style="
              margin: 0;
              color: #ffa500;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #ffa500;
            "
          >
            ⚡ 清理内容：模糊词、动物化比喻、语气声音、微表情、否定句式、绝望/神化倾向、NSFW性狂野等
          </p>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            输入文本：
          </label>
          <textarea
            v-model="antiClicheInput"
            placeholder="请输入需要清理的文本..."
            style="
              width: 100%;
              height: 120px;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              resize: vertical;
              font-family: inherit;
            "
          ></textarea>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 20px">
          <button
            class="process-button"
            :disabled="isProcessingAntiCliche || !antiClicheInput.trim()"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="handleAntiClicheProcess"
          >
            <div
              style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
              "
              class="shimmer-effect"
            ></div>
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isProcessingAntiCliche ? '处理中...' : '开始清理' }}
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(255, 107, 107, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="clearAntiClicheForm"
          >
            <div
              style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
              "
              class="shimmer-effect"
            ></div>
            <i class="fa-solid fa-trash" style="font-size: 14px; margin-right: 6px"></i>
            清空
          </button>
        </div>

        <!-- 输出区域 -->
        <div v-if="antiClicheOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
            清理结果：
          </h5>
          <div
            class="output-content"
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 300px;
              overflow-y: auto;
            "
          >
            {{ antiClicheOutput }}
          </div>

          <div class="output-actions" style="margin-top: 12px; display: flex; gap: 12px">
            <button
              class="copy-button"
              style="
                padding: 10px 20px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
                position: relative;
                overflow: hidden;
              "
              @click="copyAntiClicheResult"
            >
              <div
                style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                  transition: left 0.5s;
                "
                class="shimmer-effect"
              ></div>
              <i class="fa-solid fa-copy" style="font-size: 14px"></i> 复制结果
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色卡生成工具 -->
    <div class="tool-section">
      <div class="section-header" @click="toggleToolExpanded('characterCard')">
        <h4 style="margin: 0; color: #fff; font-size: 16px; font-weight: 600">
          <i class="fa-solid fa-user-plus" style="margin-right: 8px; color: #17a2b8"></i>
          角色卡生成工具
        </h4>
        <i
          :class="isToolExpanded('characterCard') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
          style="color: #ccc; transition: transform 0.3s ease"
        ></i>
      </div>

      <div v-if="isToolExpanded('characterCard')" class="tool-content">
        <div class="tool-instructions">
          <p style="margin: 0 0 8px 0; color: #ccc; font-size: 12px">
            <i class="fa-solid fa-info-circle" style="margin-right: 6px; color: #17a2b8"></i>
            输入角色描述，AI将自动生成角色卡（YAML 格式，纯中文）。
          </p>
          <p
            style="
              margin: 0 0 6px 0;
              color: #4a9eff;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #17a2b8;
            "
          >
            💡 包含内容：基础信息、外貌身材、核心性格、对话风格、背景经历、人际关系、演绎指导
          </p>
          <p
            style="
              margin: 0 0 6px 0;
              color: #ffa500;
              font-size: 11px;
              background: #1a1a1a;
              padding: 6px;
              border-radius: 4px;
              border-left: 3px solid #ffa500;
            "
          >
            ⚠️ 注意：身高体重使用文字描述（如"高大匀称"），避免AI刻板化，有性格对立面和修复机制
          </p>
        </div>

        <div class="form-group" style="margin: 15px 0">
          <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
            角色描述：
          </label>
          <textarea
            v-model="characterDescription"
            placeholder="请描述角色的基本信息，如外观、性格、背景等..."
            style="
              width: 100%;
              height: 120px;
              padding: 12px;
              background: #2a2a2a;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
              resize: vertical;
              font-family: inherit;
            "
          ></textarea>
        </div>

        <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 20px">
          <button
            class="generate-button"
            :disabled="isGeneratingCharacter || !characterDescription.trim()"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(23, 162, 184, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="handleGenerateCharacterCard"
          >
            <div
              style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
              "
              class="shimmer-effect"
            ></div>
            <i class="fa-solid fa-magic" style="font-size: 14px; margin-right: 6px"></i>
            {{ isGeneratingCharacter ? '生成中...' : '生成角色卡' }}
          </button>

          <button
            class="clear-button"
            style="
              padding: 12px 24px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 3px 12px rgba(255, 107, 107, 0.3);
              position: relative;
              overflow: hidden;
            "
            @click="clearCharacterForm"
          >
            <div
              style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
              "
              class="shimmer-effect"
            ></div>
            <i class="fa-solid fa-trash" style="font-size: 14px; margin-right: 6px"></i>
            清空
          </button>
        </div>

        <!-- 输出区域 -->
        <div v-if="characterCardOutput" class="output-section">
          <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
            <i class="fa-solid fa-check-circle" style="margin-right: 6px; color: #28a745"></i>
            生成的角色卡：
          </h5>
          <div
            class="output-content"
            style="
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              padding: 15px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 300px;
              overflow-y: auto;
            "
          >
            {{ characterCardOutput }}
          </div>

          <div class="output-actions" style="margin-top: 12px; display: flex; gap: 12px">
            <button
              class="copy-button"
              style="
                padding: 10px 20px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
                position: relative;
                overflow: hidden;
              "
              @click="copyCharacterCard"
            >
              <div
                style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                  transition: left 0.5s;
                "
                class="shimmer-effect"
              ></div>
              <i class="fa-solid fa-copy" style="font-size: 14px"></i> 复制角色卡
            </button>
          </div>

          <!-- 角色卡修改区域 -->
          <div class="modify-section" style="margin-top: 25px; border-top: 2px dashed #3a3a3a; padding-top: 20px">
            <h5 style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600">
              <i class="fa-solid fa-edit" style="margin-right: 6px; color: #ffa500"></i>
              修改角色卡
            </h5>
            <div
              class="modify-instructions"
              style="
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 15px;
              "
            >
              <p style="margin: 0 0 6px 0; color: #ccc; font-size: 12px">
                <i class="fa-solid fa-lightbulb" style="margin-right: 6px; color: #ffa500"></i>
                描述你想要修改的内容，AI会根据你的需求调整角色卡。例如："让角色更活泼一些"、"增加魔法技能"、"改为女性角色"等。
              </p>
              <p style="margin: 0; color: #ffa500; font-size: 11px">⚠️ 修改后会保持 YAML 格式和中文字段。</p>
            </div>

            <div class="form-group" style="margin: 15px 0">
              <label style="display: block; margin-bottom: 8px; color: #ccc; font-size: 13px; font-weight: 500">
                修改需求：
              </label>
              <textarea
                v-model="modifyRequest"
                placeholder="请描述你想要修改的内容..."
                style="
                  width: 100%;
                  height: 80px;
                  padding: 12px;
                  background: #2a2a2a;
                  border: 1px solid #3a3a3a;
                  border-radius: 6px;
                  color: #e0e0e0;
                  font-size: 13px;
                  resize: vertical;
                  font-family: inherit;
                "
              ></textarea>
            </div>

            <div class="button-group" style="display: flex; gap: 12px; margin-bottom: 15px">
              <button
                class="modify-button"
                :disabled="isModifyingCharacter || !modifyRequest.trim()"
                style="
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                  border: none;
                  border-radius: 8px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(255, 165, 0, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="handleModifyCharacterCard"
              >
                <div
                  style="
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                  "
                  class="shimmer-effect"
                ></div>
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 14px; margin-right: 6px"></i>
                {{ isModifyingCharacter ? '修改中...' : 'AI修改' }}
              </button>

              <button
                class="clear-modify-button"
                style="
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                  border: none;
                  border-radius: 8px;
                  color: white;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 3px 12px rgba(108, 117, 125, 0.3);
                  position: relative;
                  overflow: hidden;
                "
                @click="clearModifyRequest"
              >
                <div
                  style="
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                  "
                  class="shimmer-effect"
                ></div>
                <i class="fa-solid fa-eraser" style="font-size: 14px; margin-right: 6px"></i>
                清空修改需求
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { getScriptIdSafe } from '记忆/utils';
import { useSettingsStore } from '../settings';

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 响应式数据
const toolExpandedState = ref(new Map<string, boolean>());
const antiClicheInput = ref('');
const antiClicheOutput = ref('');
const isProcessingAntiCliche = ref(false);
const characterDescription = ref('');
const characterCardOutput = ref('');
const isGeneratingCharacter = ref(false);
const modifyRequest = ref('');
const isModifyingCharacter = ref(false);

// 标志位：是否已完成初始加载（避免加载时触发保存）
const isDataLoaded = ref(false);

// 从酒馆变量加载工具数据
const loadToolsData = () => {
  try {
    isDataLoaded.value = false; // 加载期间暂停自动保存
    const script_id = getScriptIdSafe();
    if (!script_id) {
      console.warn('⚠️ script_id 为空，无法加载数据');
      isDataLoaded.value = true;
      return;
    }
    const savedData = getVariables({ type: 'script', script_id });

    console.log('📥 加载工具数据:', savedData);

    // 加载反八股数据
    if (savedData.tools_antiCliche) {
      antiClicheInput.value = savedData.tools_antiCliche.input || '';
      antiClicheOutput.value = savedData.tools_antiCliche.output || '';
      console.log('✅ 已恢复反八股数据:', {
        input: antiClicheInput.value.substring(0, 50),
        output: antiClicheOutput.value.substring(0, 50),
      });
    }

    // 加载角色卡数据
    if (savedData.tools_characterCard) {
      characterDescription.value = savedData.tools_characterCard.description || '';
      characterCardOutput.value = savedData.tools_characterCard.output || '';
      modifyRequest.value = savedData.tools_characterCard.modifyRequest || '';
      console.log('✅ 已恢复角色卡数据:', {
        description: characterDescription.value.substring(0, 50),
        output: characterCardOutput.value.substring(0, 50),
        modifyRequest: modifyRequest.value.substring(0, 50),
      });
    }

    // 加载展开状态
    if (savedData.tools_expandedState) {
      toolExpandedState.value = new Map(Object.entries(savedData.tools_expandedState));
      console.log('✅ 已恢复展开状态:', Object.fromEntries(toolExpandedState.value));
    }

    // 延迟启用自动保存，避免加载时触发
    setTimeout(() => {
      isDataLoaded.value = true;
      console.log('✅ 数据加载完成，启用自动保存');
    }, 100);
  } catch (error) {
    console.error('❌ 加载工具数据失败:', error);
    isDataLoaded.value = true;
  }
};

// 保存工具数据到酒馆变量
const saveToolsDataImmediate = () => {
  // 只有在数据加载完成后才保存
  if (!isDataLoaded.value) {
    console.log('⏸️ 跳过保存：数据尚未加载完成');
    return;
  }

  try {
    const script_id = getScriptIdSafe();
    if (!script_id) {
      console.warn('⚠️ script_id 为空，无法保存数据');
      return;
    }

    const dataToSave = {
      tools_antiCliche: {
        input: antiClicheInput.value,
        output: antiClicheOutput.value,
      },
      tools_characterCard: {
        description: characterDescription.value,
        output: characterCardOutput.value,
        modifyRequest: modifyRequest.value,
      },
      tools_expandedState: Object.fromEntries(toolExpandedState.value),
    };

    insertOrAssignVariables(dataToSave, { type: 'script', script_id });
    console.log('💾 工具数据已保存:', {
      antiCliche_input_length: antiClicheInput.value.length,
      antiCliche_output_length: antiClicheOutput.value.length,
      character_desc_length: characterDescription.value.length,
      character_output_length: characterCardOutput.value.length,
    });
  } catch (error) {
    console.error('❌ 保存工具数据失败:', error);
  }
};

// 使用防抖来避免频繁保存（减少到300ms，更快响应）
const saveToolsData = debounce(saveToolsDataImmediate, 300);

// 监听数据变化并自动保存
watch(
  [antiClicheInput, antiClicheOutput, characterDescription, characterCardOutput, modifyRequest, toolExpandedState],
  () => {
    if (isDataLoaded.value) {
      console.log('📝 数据变化，触发保存...');
      saveToolsData();
    }
  },
  { deep: true },
);

// 组件挂载时加载数据
onMounted(() => {
  console.log('🔧 ToolsTab 组件已挂载，加载数据...');
  loadToolsData();
});

// 组件卸载前保存数据
onBeforeUnmount(() => {
  console.log('🔄 ToolsTab 组件即将卸载，保存数据...');
  // 取消防抖，立即保存
  saveToolsData.cancel();
  saveToolsDataImmediate();
});

// 切换工具展开状态
const toggleToolExpanded = (toolName: string) => {
  console.log('toggleToolExpanded 被调用，工具名称:', toolName);
  const current = toolExpandedState.value.get(toolName) || false;
  console.log('当前展开状态:', current);
  toolExpandedState.value.set(toolName, !current);
  console.log('新的展开状态:', !current);
};

// 检查工具是否展开
const isToolExpanded = (toolName: string) => {
  return toolExpandedState.value.get(toolName) || false;
};

// 统一的复制函数 - 针对iframe环境优化
const copyToClipboard = async (text: string, successMessage: string) => {
  console.log('🔍 开始复制，文本长度:', text.length);
  console.log('🔍 是否在iframe中:', window.parent !== window);

  // 方法1：优先在父窗口中复制（最可靠的方法）
  if (window.parent && window.parent !== window) {
    console.log('🔍 尝试在父窗口中复制...');
    const parentSuccess = tryParentWindowCopy(text);
    if (parentSuccess) {
      console.log('✅ 父窗口复制成功');
      window.toastr.success(successMessage);
      return;
    } else {
      console.warn('⚠️ 父窗口复制失败');
    }
  }

  // 方法2：尝试 execCommand 在当前窗口
  try {
    console.log('🔍 尝试 execCommand 复制...');
    const success = execCommandCopy(text);
    if (success) {
      console.log('✅ execCommand 复制成功');
      window.toastr.success(successMessage);
      return;
    } else {
      console.warn('⚠️ execCommand 复制失败');
    }
  } catch (error) {
    console.warn('❌ execCommand 复制异常:', error);
  }

  // 方法3：尝试现代 Clipboard API
  try {
    if (navigator.clipboard && window.isSecureContext) {
      console.log('🔍 尝试 Clipboard API 复制...');
      await navigator.clipboard.writeText(text);

      // 验证是否真的复制成功
      const clipboardContent = await navigator.clipboard.readText();
      if (clipboardContent === text) {
        console.log('✅ Clipboard API 复制成功（已验证）');
        window.toastr.success(successMessage);
        return;
      } else {
        console.warn('⚠️ Clipboard API 复制后验证失败');
      }
    }
  } catch (error) {
    console.warn('❌ Clipboard API 失败:', error);
  }

  // 所有方法都失败，显示手动复制对话框
  console.log('⚠️ 所有自动复制方法都失败，显示手动复制对话框');
  showManualCopyDialog(text);
};

// 在父窗口中尝试复制
const tryParentWindowCopy = (text: string): boolean => {
  try {
    if (window.parent && window.parent !== window) {
      console.log('  📝 在父窗口创建临时textarea...');

      // 在父窗口中创建临时元素并复制
      const parentDoc = window.parent.document;
      const tempTextArea = parentDoc.createElement('textarea');
      tempTextArea.value = text;

      // 设置样式使其不可见但仍然可选中
      tempTextArea.style.cssText = `
        position: fixed !important;
        left: -9999px !important;
        top: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
      `;
      tempTextArea.setAttribute('readonly', '');

      parentDoc.body.appendChild(tempTextArea);
      console.log('  📝 Textarea已添加到父窗口');

      // 聚焦并选中文本
      tempTextArea.focus();
      tempTextArea.select();
      tempTextArea.setSelectionRange(0, text.length);
      console.log('  📝 文本已选中');

      // 尝试复制
      const success = parentDoc.execCommand('copy');
      console.log('  📝 execCommand结果:', success);

      // 清理
      parentDoc.body.removeChild(tempTextArea);
      console.log('  📝 Textarea已清理');

      return success;
    }
  } catch (error) {
    console.error('❌ 父窗口复制异常:', error);
  }
  return false;
};

// execCommand 复制方法
const execCommandCopy = (text: string): boolean => {
  try {
    console.log('  📝 在当前窗口创建临时textarea...');

    // 创建临时文本区域
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 设置样式
    textArea.style.cssText = `
      position: fixed !important;
      left: -9999px !important;
      top: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      pointer-events: none !important;
    `;
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    console.log('  📝 Textarea已添加到当前窗口');

    // 聚焦并选中
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    console.log('  📝 文本已选中');

    // 尝试复制
    const success = document.execCommand('copy');
    console.log('  📝 execCommand结果:', success);

    // 清理
    document.body.removeChild(textArea);
    console.log('  📝 Textarea已清理');

    return success;
  } catch (error) {
    console.error('❌ execCommand 复制异常:', error);
    return false;
  }
};

// 手动复制对话框 - 更可靠的实现
const showManualCopyDialog = (text: string) => {
  try {
    console.log('📋 显示手动复制对话框');

    // 尝试在父窗口中创建对话框（更可靠）
    const targetDoc = window.parent && window.parent !== window ? window.parent.document : document;
    const targetBody = targetDoc.body;

    console.log('📋 目标文档:', targetDoc === window.parent.document ? '父窗口' : '当前窗口');

    // 移除可能存在的旧对话框
    const existingModal = targetDoc.getElementById('manual-copy-modal-tools');
    if (existingModal) {
      targetBody.removeChild(existingModal);
    }

    // 创建模态对话框
    const modal = targetDoc.createElement('div');
    modal.id = 'manual-copy-modal-tools';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const dialog = targetDoc.createElement('div');
    dialog.style.cssText = `
      background: #2a2a2a;
      border: 2px solid #ffa500;
      border-radius: 12px;
      padding: 25px;
      max-width: 700px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    `;

    dialog.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #ffa500; font-size: 18px; font-weight: 600;">
        <i class="fa-solid fa-copy" style="margin-right: 8px;"></i>
        手动复制内容
      </h3>
      <div style="background: #1a1a1a; border: 1px solid #3a3a3a; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
        <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
          ⚠️ 自动复制功能在当前环境下不可用，请手动复制以下内容：
        </p>
        <ol style="margin: 8px 0 0 20px; padding: 0; color: #ccc; font-size: 13px;">
          <li>点击下方文本框选中内容</li>
          <li>按 <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">Ctrl+A</kbd> 全选</li>
          <li>按 <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">Ctrl+C</kbd> 复制</li>
        </ol>
      </div>
      <textarea
        readonly
        id="copyTextarea"
        style="
          width: 100%;
          height: 300px;
          background: #1a1a1a;
          border: 2px solid #3a3a3a;
          border-radius: 6px;
          padding: 12px;
          color: #e0e0e0;
          font-size: 13px;
          font-family: 'Courier New', Consolas, monospace;
          resize: vertical;
          margin-bottom: 15px;
          box-sizing: border-box;
        "
      >${text}</textarea>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="manualCopyBtn" style="
          padding: 10px 20px;
          background: #28a745;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">尝试自动复制</button>
        <button id="closeBtn" style="
          padding: 10px 20px;
          background: #6c757d;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">关闭</button>
      </div>
    `;

    modal.appendChild(dialog);
    targetBody.appendChild(modal);
    console.log('📋 对话框已添加到DOM');

    // 自动选中文本
    const textarea = dialog.querySelector('#copyTextarea') as HTMLTextAreaElement;
    setTimeout(() => {
      textarea.focus();
      textarea.select();
      console.log('📋 文本已自动选中');
    }, 100);

    // 绑定事件
    const copyBtn = dialog.querySelector('#manualCopyBtn') as HTMLButtonElement;
    const closeBtn = dialog.querySelector('#closeBtn') as HTMLButtonElement;

    copyBtn.onmouseover = () => (copyBtn.style.background = '#218838');
    copyBtn.onmouseout = () => (copyBtn.style.background = '#28a745');
    closeBtn.onmouseover = () => (closeBtn.style.background = '#5a6268');
    closeBtn.onmouseout = () => (closeBtn.style.background = '#6c757d');

    copyBtn.onclick = () => {
      try {
        console.log('📋 尝试通过按钮复制...');
        textarea.focus();
        textarea.select();
        const success = targetDoc.execCommand('copy');
        console.log('📋 复制结果:', success);

        if (success) {
          window.toastr.success('复制成功！');
          targetBody.removeChild(modal);
        } else {
          window.toastr.warning('自动复制失败，请手动按 Ctrl+C 复制');
        }
      } catch (error) {
        console.error('📋 复制异常:', error);
        window.toastr.warning('自动复制失败，请手动按 Ctrl+C 复制');
      }
    };

    closeBtn.onclick = () => {
      console.log('📋 关闭对话框');
      targetBody.removeChild(modal);
    };

    // 点击背景关闭
    modal.onclick = e => {
      if (e.target === modal) {
        console.log('📋 点击背景关闭');
        targetBody.removeChild(modal);
      }
    };

    // ESC键关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('📋 按ESC关闭');
        targetBody.removeChild(modal);
        targetDoc.removeEventListener('keydown', handleEsc);
      }
    };
    targetDoc.addEventListener('keydown', handleEsc);

    window.toastr.info('已打开手动复制对话框，请按照提示操作', '', { timeOut: 3000 });
  } catch (error) {
    console.error('❌ 显示复制对话框失败:', error);
    window.toastr.error('无法显示复制对话框：' + (error as Error).message);
  }
};

// 反八股工具处理函数
const handleAntiClicheProcess = async () => {
  if (!antiClicheInput.value.trim()) {
    window.toastr.warning('请输入需要清理的文本');
    return;
  }

  try {
    isProcessingAntiCliche.value = true;
    window.toastr.info('AI正在分析文本...', '反八股清理', { timeOut: 15000 });

    const response = await fetch(settings.value.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model,
        messages: [
          {
            role: 'system',
            content: `你是一个文本编辑助手，负责系统性地清理角色卡、世界书和开场白中的八股表述。请按照以下九个步骤严格执行：

## 第一步：去除模糊词和类比词
删除：似乎、几乎、近乎、好像、仿佛、如同、宛如、恰似、一丝、一抹、一丝丝、一般、不易察觉、若有若无

## 第二步：去除八股比喻词
- 删除所有动物化比喻：像小兔子一样、像小兽一样、像猫咪一样、野兽、小兽、幼兽、低吼、嘶吼
- 删除投石类比喻：投石入水、石头落地等
- 直接描述动作和状态，不使用比喻

## 第三步：去除语气声音描述
删除：带着xxx的口吻/语气、声音比寒冰更冰冷、用不容置疑的语气、每个字都带着xxx、沙哑的声音、任何声音质感描述
**原则：完全不描写语气，由对话内容本身凸显人设**

## 第四步：去除微表情和微动作
删除：流露出xxx神色、眼里漾起/闪过xxx、嘴角上扬/翘起弧度、露出一丝微笑、指尖泛白、下意识/无意识的动作、狡黠、甜腻等表情
**替代：如需小动作，用"习惯性地"而非"下意识"**

## 第五步：去除"不是……而是……"句式
清理所有否定转折句，直接写"而是"后面的内容

## 第六步：修改外貌描述
- 瞳色移入对话由角色自述
- 女性罩杯改为"胸部平坦/丰满"等描述
- 精确身高改为"高一米八"等描述性语言
- 删除三维尺寸数据

## 第七步：重写语料和性格描述
- 语料只用纯对话，不附加表情动作神态
- 通过具体行为反应体现性格，避免性格标签
- 用陈述式肯定型描述，不加修辞

## 第八步：防止绝望/神化/掌控倾向
- 删除极端情绪词：极大的恐惧、非常害怕、极度羞耻、极度不安
- 删除负面状态词：畏缩、空白、一卡一卡、机械化、僵硬
- 不写角色心理反应和内心想法
- 不写user的心理反应，不神化角色

## 第九步：NSFW部分防性狂野
- 删除：喜欢粗暴/加速、喜欢性快感、疼痛痛苦相关
- 删除：撕碎、撕裂、破碎、绞、绞缠、碾、碾磨、研磨、攫、尖叫、高亢、呜咽、生理性泪水、甬道、弓起、灭顶的快感、细碎
- 避免性器官尺寸夸张描述

## 完整禁用词列表（必须删除）：
模糊词：一丝、一抹、似乎、几乎、近乎、仿佛、如同、宛如、恰似、不易察觉、若有若无
动物化：野兽、小兽、幼兽、像小兔子、像猫咪、低吼、嘶吼、受惊的小兽
情绪词：狡黠、甜腻、疯狂、戏谑、恼怒、困惑、恐惧、绝望、崇拜、狂热、空洞、毫无生气、自嘲、苦涩、冰冷、暧昧、虔诚
动作词：闪过、闪着、发白、撕碎、撕裂、弧度、破碎、绞、尖叫、呜咽、沙哑、碾、研磨、攫、弓起、细碎、指节发白、无意识的、下意识、蜷缩、痉挛、僵住、楞在原地、颤抖、垮了下来、紧握、攥住、勾住、绞在一起、压得喘不过气、淹没、击垮、划开、刺破、吞噬
生理词：生理性泪水、甬道、灭顶的快感、暖流涌上心头、如坠冰窟、浑身冰冷、手脚冰凉、大脑一片空白、嗡嗡作响、呼吸一滞、倒吸一口凉气、身体僵硬、如遭雷击、细密的汗珠
比喻类：石子投入湖中、泛起涟漪、针扎破气球、手术刀划开、受惊小兽、提线木偶、命运的齿轮、回忆潮水、阳光斑驳、光影、像根针一样扎进
声音类：沙哑、磁性、深沉、银铃般清脆、声音里不带一丝温度、低沉而富有磁性、细若蚊呐
抽象词：心湖、古井、深渊、谷底、时间静止、空气凝固、圣物、虔诚、宛若神明、恶魔、献祭、仪式、审判、征服、支配、占有、凝固、陷入、木讷、毁天灭地、铺天盖地、淬毒刀子、穿云裂石、氤氲、有毒藤蔓、揉入骨血
否定句式：不是而是、并不存在
程度词：铺天盖地、狂风暴雨、毁天灭地、充满了xxx、不容质疑、不容错辨、不容抗拒、随时、立刻、瞬间、顷刻间

**重要原则：**
1. 直接删除禁用词，不要替换为同义词
2. 用具体行为替代抽象情绪和心理描写
3. 保持原文核心意思，但表达方式要彻底改变
4. 语料必须是纯对话，不带任何动作表情
5. 外貌和性格用陈述式肯定描述，不用修辞

请严格按照以上标准清理文本，直接输出清理后的结果，不要添加任何解释或说明。`,
          },
          {
            role: 'user',
            content: antiClicheInput.value,
          },
        ],
        max_tokens: settings.value.max_tokens || 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    antiClicheOutput.value = data.choices[0].message.content.trim();
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('文本清理完成！');
  } catch (error) {
    console.error('反八股清理失败:', error);
    window.toastr.error('清理失败：' + (error as Error).message);
  } finally {
    isProcessingAntiCliche.value = false;
  }
};

const copyAntiClicheResult = () => {
  if (!antiClicheOutput.value) {
    window.toastr.warning('没有可复制的内容');
    return;
  }

  // 使用统一的复制函数
  copyToClipboard(antiClicheOutput.value, '清理结果已复制到剪贴板');
};

// 角色卡生成工具相关函数
const handleGenerateCharacterCard = async () => {
  if (!characterDescription.value.trim()) {
    window.toastr.warning('请输入角色描述');
    return;
  }

  try {
    isGeneratingCharacter.value = true;
    window.toastr.info('AI正在生成角色卡，请稍候...');

    const response = await fetch(settings.value.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model || 'gpt-3.5-turbo',
        max_tokens: settings.value.max_tokens || 16000,
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: `你是一个角色卡生成助手。请系统性地创建一个完整的角色卡。

**输出格式要求**：
- 必须使用 YAML 格式，所有字段名和内容都用中文
- 确保输出完整，不要截断
- 避免AI刻板化，要有多样性和真实感
- 严格避免任何AI指令式语言

**角色卡结构模板**：
\`\`\`yaml
基础信息:
  姓名: "全名"
  年龄: 具体年龄
  出生年月: "YYYY年MM月"
  性别: "男/女/其他"
  第二性别: "Alpha/Beta/Omega/无"
  身高体重: "身高用文字描述（高大/中等/娇小等），体重用文字描述（匀称/纤瘦/丰满等）"
  信息素: "描述气味特征和变化规律（如适用）"
  性取向: "异性恋/同性恋/双性恋等"
  恋爱经验: "详细描述"
  身份职业: "具体职业和社会地位"
  标志性特征:
    微信昵称: "昵称"
    头像: "描述"
    其他: "其他标志性特征"

外貌与身材:
  整体身形: "高矮胖瘦、肌肉类型的详细描述"
  面容特征:
    发型: "发型、发色、发质"
    肤色: "肤色描述"
    眼睛: "眼睛颜色和特征"
    五官: "五官特点"
  穿搭风格: "日常穿搭偏好和风格"
  声音特征: "音色、音调、说话节奏"
  习惯性动作: "常见的姿态和小动作"

性格与心理:
  主要性格特征:
    - 特质1: "具体表现和行为模式"
    - 特质2: "具体表现和行为模式"
    - 特质3: "具体表现和行为模式"
  性格的两面性: "在不同情况下展现的不同侧面（例如：平时温和但触及底线时强硬）"
  情绪模式:
    常见情绪: "日常主要情绪状态"
    情绪触发点: "什么容易引发情绪波动"
    情绪表达方式: "如何表现和处理情绪"
  应对压力: "面对压力和困境时的反应和处理方式"

对话风格:
  日常语气: "用词习惯和说话特点"
  对不同对象:
    亲近的人: "说话方式"
    陌生人: "说话方式"
    工作场合: "说话方式"
  情绪变化时: "情绪激动/低落时的语言变化"
  口头禅: ["口头禅1", "口头禅2"]

背景经历:
  家庭背景: "详细的家庭环境和成长背景"
  教育经历: "学习经历"
  重要人生事件: ["事件1", "事件2", "事件3"]
  关键转折点: "改变TA的重要事件"
  当前状况: "现在的生活状态"
  人生目标: "TA想要达成的目标"

人际关系:
  对主要角色的态度: "与{{user}}或其他重要角色的互动模式"
  社交偏好: "喜欢的社交方式和边界"
  群体角色: "在团队中的定位（领导者/协调者/观察者等）"
  冲突处理: "如何处理矛盾和冲突"

行为模式与动机:
  典型行为:
    主动倾向: "TA倾向于主动做什么事情"
    回避倾向: "TA会避免或拒绝做什么"
    习惯反应: "在特定情况下的典型反应"
  底线与原则: "TA坚守的原则和不可触碰的底线"
  内在动机:
    行动驱动: "推动TA行动的内在原因"
    深层需求: "TA内心真正渴望的是什么"
    隐藏想法: "TA不轻易表露的真实想法"
  情绪管理:
    失控边界: "什么情况下会情绪失控"
    恢复方式: "如何平复情绪和自我调节"
\`\`\`

请基于用户的描述，生成一个完整、立体、真实的角色。注意：
1. 身高体重必须用文字描述，不要用数字和单位
2. 性格要展现多面性和复杂性，避免单一化和刻板印象
3. 行为模式要从角色视角出发，描述TA会如何思考和行动
4. 所有内容要详细丰富，有具体例子和场景`,
          },
          {
            role: 'user',
            content: characterDescription.value,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    characterCardOutput.value = data.choices[0].message.content.trim();
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('角色卡生成完成！');
  } catch (error) {
    console.error('角色卡生成失败:', error);
    window.toastr.error('生成失败：' + (error as Error).message);
  } finally {
    isGeneratingCharacter.value = false;
  }
};

const clearCharacterForm = () => {
  characterDescription.value = '';
  characterCardOutput.value = '';
  modifyRequest.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('内容已清空');
};

const copyCharacterCard = () => {
  if (!characterCardOutput.value) {
    window.toastr.warning('没有可复制的内容');
    return;
  }

  // 使用统一的复制函数
  copyToClipboard(characterCardOutput.value, '角色卡已复制到剪贴板');
};

// 清空反八股表单
const clearAntiClicheForm = () => {
  antiClicheInput.value = '';
  antiClicheOutput.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('内容已清空');
};

// 修改角色卡
const handleModifyCharacterCard = async () => {
  if (!modifyRequest.value.trim()) {
    window.toastr.warning('请输入修改需求');
    return;
  }

  if (!characterCardOutput.value) {
    window.toastr.warning('没有可修改的角色卡，请先生成角色卡');
    return;
  }

  try {
    isModifyingCharacter.value = true;
    window.toastr.info('AI正在根据你的需求修改角色卡，请稍候...');

    const response = await fetch(settings.value.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify({
        model: settings.value.model || 'gpt-3.5-turbo',
        max_tokens: settings.value.max_tokens || 16000,
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: `你是一个角色卡编辑助手。用户会提供一个现有的 YAML 格式角色卡和修改需求，请根据修改需求调整角色卡内容。

**修改原则**：
1. 必须保持 YAML 格式，所有字段名和内容都使用中文
2. 只修改用户明确要求修改的部分
3. 确保修改后的内容与原有角色卡风格一致
4. 如果用户的要求与原有设定冲突，以用户的要求为准
5. 输出完整的修改后的角色卡，不要截断
6. 保持原有的字段结构，除非用户要求添加或删除字段

**重要注意事项**：
- 身高体重必须用文字描述（高大/中等/娇小/匀称/纤瘦等），不要用数字和单位
- 保持性格的多面性和复杂性，避免单一化
- 行为模式要从角色视角出发，描述角色会如何思考和行动
- 避免AI刻板化，保持角色的真实感和多样性

请输出完整的 YAML 格式角色卡。`,
          },
          {
            role: 'user',
            content: `以下是现有的角色卡：

${characterCardOutput.value}

---

请根据以下修改需求调整角色卡：
${modifyRequest.value}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    characterCardOutput.value = data.choices[0].message.content.trim();
    modifyRequest.value = ''; // 清空修改需求
    saveToolsDataImmediate(); // 立即保存结果

    window.toastr.success('角色卡修改完成！');
  } catch (error) {
    console.error('角色卡修改失败:', error);
    window.toastr.error('修改失败：' + (error as Error).message);
  } finally {
    isModifyingCharacter.value = false;
  }
};

// 清空修改需求
const clearModifyRequest = () => {
  modifyRequest.value = '';
  saveToolsDataImmediate(); // 立即保存
  window.toastr.success('修改需求已清空');
};
</script>

<style scoped>
.tools-tab {
  height: 100%;
  overflow-y: auto;
  padding: 25px !important;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  border: 1px solid #3a3a3a;
}

.section-header:hover {
  background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tool-content {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.tool-instructions {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 12px;
  color: #ccc;
  font-size: 12px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.output-section {
  margin-top: 20px;
}

.output-content {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 15px;
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.output-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

/* 按钮样式 */
.process-button,
.clear-button,
.generate-button,
.copy-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.process-button:hover:not(:disabled),
.clear-button:hover:not(:disabled),
.generate-button:hover:not(:disabled),
.copy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.copy-button:hover {
  background: #218838 !important;
}

.tool-instructions {
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 12px;
  color: #ccc;
  font-size: 12px;
  margin-bottom: 15px;
}

/* 美化按钮的悬停效果 */
.process-button:hover:not(:disabled) .shimmer-effect,
.clear-button:hover:not(:disabled) .shimmer-effect,
.generate-button:hover:not(:disabled) .shimmer-effect,
.copy-button:hover .shimmer-effect {
  left: 100%;
}

.process-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.clear-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4);
}

.copy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.process-button:disabled,
.clear-button:disabled,
.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.process-button:disabled:hover,
.clear-button:disabled:hover,
.generate-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 滚动条样式 */
.output-content::-webkit-scrollbar {
  width: 6px;
}

.output-content::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.output-content::-webkit-scrollbar-thumb {
  background: #3a3a3a;
  border-radius: 3px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: #4a4a4a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .output-actions {
    flex-direction: column;
  }
}
</style>

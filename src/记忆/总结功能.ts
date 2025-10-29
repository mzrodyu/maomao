import { useSettingsStore } from './settings';

/**
 * 获取可用的模型列表
 */
export async function fetchAvailableModels(): Promise<string[]> {
  const settings = useSettingsStore().settings;

  // 验证 API endpoint
  if (!settings.api_endpoint || settings.api_endpoint.trim() === '') {
    throw new Error('API 端点未配置');
  }

  const apiUrl = settings.api_endpoint.trim();
  console.log('获取模型列表，URL:', apiUrl);

  try {
    new URL(apiUrl);
  } catch (e) {
    if (apiUrl.startsWith('/')) {
      throw new Error(
        `API 端点必须是完整的 URL（如 https://api.openai.com/v1/chat/completions），不能是相对路径（${apiUrl}）`,
      );
    }
    throw new Error(`API 端点格式不正确: ${apiUrl}`);
  }

  // 尝试多个可能的 models API 端点
  const possibleEndpoints = [
    apiUrl.replace('/chat/completions', '/models'),
    apiUrl.replace('/v1/chat/completions', '/v1/models'),
    apiUrl + '/../models', // 备用方式
  ];

  console.log('尝试的模型端点:', possibleEndpoints);

  for (const modelsUrl of possibleEndpoints) {
    try {
      console.log(`尝试请求: ${modelsUrl}`);

      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.api_key}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        console.log(`端点 ${modelsUrl} 返回 ${response.status}，尝试下一个...`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`端点 ${modelsUrl} 返回非 JSON 内容，尝试下一个...`);
        continue;
      }

      const data = await response.json();
      console.log('API 返回数据:', data);

      // OpenAI 兼容 API 返回格式
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((model: any) => model.id || model.name).filter(Boolean);
        console.log('获取到的模型列表:', models);
        return models;
      }

      // 有些 API 可能直接返回数组
      if (Array.isArray(data)) {
        const models = data.map((model: any) => model.id || model.name).filter(Boolean);
        console.log('获取到的模型列表:', models);
        return models;
      }

      console.log('响应格式未识别，尝试下一个端点...');
    } catch (e) {
      console.log(`端点 ${modelsUrl} 请求失败:`, e);
      continue;
    }
  }

  throw new Error('无法从 API 获取模型列表，所有端点都返回失败。该 API 可能不支持模型列表接口，请手动输入模型名称。');
}

/**
 * 总结指定楼层的消息上下文
 * @param start_id 开始楼层
 * @param end_id 结束楼层
 * @returns 总结文本
 */
export async function summarizeMessages(start_id: number, end_id: number): Promise<string> {
  const settings = useSettingsStore().settings;

  // 验证 API endpoint
  if (!settings.api_endpoint || settings.api_endpoint.trim() === '') {
    throw new Error('API 端点未配置');
  }

  // 验证是否为完整的 URL
  const apiUrl = settings.api_endpoint.trim();
  console.log('API URL:', apiUrl);

  try {
    new URL(apiUrl);
  } catch (e) {
    // 如果不是完整 URL，尝试自动补全
    if (apiUrl.startsWith('/')) {
      throw new Error(
        `API 端点必须是完整的 URL（如 https://api.openai.com/v1/chat/completions），不能是相对路径（${apiUrl}）`,
      );
    }
    throw new Error(`API 端点格式不正确: ${apiUrl}`);
  }

  // 获取要总结的消息
  // 遍历每个楼层获取消息
  const messages: Array<{ role: string; message: string }> = [];
  for (let i = start_id; i <= end_id; i++) {
    const msg = getChatMessages(i);
    if (msg.length > 0) {
      messages.push(...msg);
    }
  }

  if (messages.length === 0) {
    throw new Error('没有可总结的消息');
  }

  // 构建总结提示 - 要求详细全面的剧情总结
  const summaryPrompt = `你是一位专业的剧情总结助手。请对以下对话内容进行总结，**重点总结正文剧情**。

总结要求：
- 按时间顺序或逻辑顺序组织信息
- 保留关键事件和重要细节，省略冗余描述
- 直接陈述事实，避免主观评价
- 使用简洁清晰的语言，避免过度修饰
- 突出事件发展脉络和关键转折点
- 不使用任何XML标签，纯文字叙述
- 不回避任何敏感内容，保证记录完全还原前文
- 总结长度约 ${settings.max_tokens / 4} 字
- **重要：直接输出总结内容，不要添加任何回复语、问候语或解释性文字**

总结必须使用以下格式：
【关键事件标题】
关键事件概述。
发生地点: [地点]
关键角色: [角色列表]

• 分解事件1（小标题形式）: 简要描述
• 分解事件2（小标题形式）: 简要描述
• 分解事件3（小标题形式）: 简要描述
...

对话内容：
${messages.map(msg => `[${msg.role}]: ${msg.message}`).join('\n\n')}

直接输出总结内容，不要任何回复语：`;

  console.log('准备调用 API，URL:', apiUrl);
  console.log('请求体:', {
    model: settings.model,
    messages: [{ role: 'user', content: summaryPrompt }],
    max_tokens: settings.max_tokens,
    temperature: settings.temperature,
  });

  // 调用 OpenAI 兼容 API
  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.api_key}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: 'user',
            content: summaryPrompt,
          },
        ],
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
      }),
    });
  } catch (e) {
    console.error('fetch 调用失败:', e);
    throw new Error(`无法连接到 API: ${(e as Error).message}`);
  }

  if (!response.ok) {
    let errorMessage = `API 请求失败: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.error?.message || error.message || errorMessage;
    } catch (e) {
      // 如果响应不是 JSON，使用状态码
      errorMessage = `API 请求失败: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
    throw new Error('API 返回数据格式错误');
  }
  return data.choices[0].message.content;
}

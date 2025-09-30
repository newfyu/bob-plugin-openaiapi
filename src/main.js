//@ts-check

var lang = require('./lang.js');

function supportLanguages() {
  return lang.supportLanguages.map(([standardLang]) => standardLang);
}

/**
 * @param {string} apiKey - The authentication API key.
 * @returns {{
 * "Accept": string;
 * "Content-Type": string;
 * Authorization: string;
 * }} The header object.
 */
function buildHeader(apiKey) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

/**
 * @param {Bob.TranslateQuery} query
 * @returns {{generatedSystemPrompt: string, generatedUserPrompt: string}}
 */
function generatePrompts (query)  {
 const SYSTEM_PROMPT = "You are an expert translator. Your task is to accurately translate the given text without altering its original meaning, tone, and style. Present only the translated result without any additional commentary.";

  let generatedSystemPrompt = null;
  const detectFrom =  query.detectFrom
  const detectTo =  query.detectTo
  const sourceLang = lang.langMap.get(detectFrom) || detectFrom;
  const targetLang = lang.langMap.get(detectTo) || detectTo;
  let generatedUserPrompt = `Please translate below text from ${sourceLang} to ${targetLang}. Present only the translated result without any additional commentary`;

  if (detectTo === "wyw" || detectTo === "yue") generatedUserPrompt = `翻译成${targetLang}，只呈现翻译结果,不需要任何额外的评论`;
  if (detectFrom === "wyw" || detectFrom === "zh-Hans" || detectFrom === "zh-Hant") {
    if (detectTo === "zh-Hant") {
      generatedUserPrompt = "翻译成繁体白话文，只呈现翻译结果,不需要任何额外的评论";
    } else if (detectTo === "zh-Hans") {
      generatedUserPrompt = "翻译成简体白话文，只呈现翻译结果,不需要任何额外的评论";
    } else if (detectTo === "yue") generatedUserPrompt = "翻译成粤语白话文，只呈现翻译结果,不需要任何额外的评论";
  }

  if (detectFrom === detectTo) {
    generatedSystemPrompt = "You are an expert text embellisher. Your sole purpose is to enhance and elevate the given text without altering its core meaning or intent. Please refrain from interpreting or explaining the text. Just give me the result. Present only the refined result without any additional commentary.";
    if (detectTo === "zh-Hant" || detectTo === "zh-Hans") {
      generatedUserPrompt = "润色此句，只呈现翻译结果,不需要任何额外的评论";
    } else {
      generatedUserPrompt = "polish this sentence. Present only the refined result without any additional commentary:";
    }
  }

  generatedUserPrompt = `${generatedUserPrompt}:\n\n${query.text}`

  return {
    generatedSystemPrompt: generatedSystemPrompt ?? SYSTEM_PROMPT,
    generatedUserPrompt
  };
}



/**
 * @param {string} model
 * @param {Bob.TranslateQuery} query
 * @returns {{
 * model: string;
 * messages: {role: string; content: string}[];
 * temperature: number;
 * max_tokens: number;
 * stream: boolean;
 * }}
 */
function buildRequestBody(model, query, enableStream) {
  const {generatedSystemPrompt, generatedUserPrompt} = generatePrompts(query);

  // prompt
  const replacePromptKeywords = (/** @type {string} */ prompt, /** @type {Bob.TranslateQuery} */ query) => {
      if (!prompt) return prompt;
      return prompt.replace("$text", query.text)
          .replace("$sourceLang", query.detectFrom)
          .replace("$targetLang", query.detectTo);
  }
  const customSystemPrompt = replacePromptKeywords($option.customSystemPrompt, query);
  const customUserPrompt = replacePromptKeywords($option.customUserPrompt, query);
  const systemPrompt = customSystemPrompt || generatedSystemPrompt;
  const userPrompt = customUserPrompt || generatedUserPrompt;

  $log.info(`System Prompt:${systemPrompt}\nUser Prompt:${userPrompt}`);

  /** @type {{role: string, content: string}[]} */
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: userPrompt });

  return {
    model: model,
    messages,
    temperature: Number($option.temperature ?? 0.7),
    max_tokens: 4096,
    stream: !!enableStream,
  };
}

/**
 * @param {Bob.TranslateQuery} query
 * @param {Bob.HttpResponse} result
 * @returns {void}
 */
function handleError(query, result) {
  const statusCode = result.response ? result.response.statusCode : 0;
  const reason = statusCode >= 400 && statusCode < 500 ? 'param' : 'api';
  const errorMessage =
    (result.data && (result.data.error?.message || result.data.error?.code)) ||
    (result.data && result.data.detail) ||
    '接口响应错误';

  // Enhanced error logging
  $log.error(`Translation error: ${errorMessage}. Status code: ${statusCode}. Full response: ${JSON.stringify(result)}`);

  query.onCompletion({
    error: {
      type: reason,
      message: `${errorMessage}`,
      addtion: JSON.stringify(result),
    },
  });
}

/**
 * 解析流事件数据并根据事件类型进行处理
 * @param {string} line 从流中接收到的一行数据
 */
function parseStreamData(line) {
  const dataMatch = line.match(/^data:\s*(.*)$/);
  if (!dataMatch) return null;

  const dataStr = dataMatch[1];
  if (dataStr === '[DONE]') {
    return { done: true };
  }

  try {
    const data = JSON.parse(dataStr);
    return { data };
  } catch (err) {
    $log.error(`Failed to parse stream data: ${dataStr}`);
    return null;
  }
}

/**
 * @param {Bob.TranslateQuery} query
 * @param {string} targetText
 * @param {any} responseObj
 * @returns {{ text: string, finished: boolean }}
 */
function handleResponse(query, targetText, responseObj) {
  let resultText = targetText;
  let isFinished = false;

  try {
    if (!responseObj || !responseObj.choices) {
      return { text: resultText, finished: false };
    }

    for (const choice of responseObj.choices) {
      const delta = choice.delta;

      if (delta && delta.content) {
        const deltaContent = delta.content;

        if (typeof deltaContent === 'string') {
          resultText += deltaContent;
        } else if (Array.isArray(deltaContent)) {
          for (const item of deltaContent) {
            if (typeof item === 'string') {
              resultText += item;
            } else if (item && typeof item === 'object' && 'text' in item) {
              // @ts-ignore - OpenAI may send structured content objects
              resultText += item.text;
            }
          }
        }

        if (typeof query.onStream === 'function') {
          query.onStream({
            result: {
              from: query.detectFrom,
              to: query.detectTo,
              toParagraphs: [resultText],
            },
          });
        }
      }

      if (choice.finish_reason) {
        isFinished = true;
      }
    }

    return { text: resultText, finished: isFinished };
  } catch (err) {
    // 错误处理
    query.onCompletion({
      error: {
        type: err._type || 'param',
        message: err.message || 'JSON 解析错误',
        // @ts-ignore
        addition: err._addition,
      },
    });
    return { text: resultText, finished: true };
  }
}

/**
 * @type {Bob.Translate}
 */
function translate(query) {
  // Input validation
  if (!query || typeof query !== 'object') {
    return query.onCompletion({
      error: {
        type: 'param',
        message: 'Invalid query object',
        addtion: 'Query must be a valid object',
      },
    });
  }

  if (!query.text || typeof query.text !== 'string' || query.text.trim() === '') {
    return query.onCompletion({
      error: {
        type: 'param',
        message: 'Invalid input text',
        addtion: 'Input text must be a non-empty string',
      },
    });
  }

  if (!lang.langMap.get(query.detectTo)) {
      return query.onCompletion({
          error: {
              type: 'unsupportLanguage',
              message: '不支持该语种',
              addtion: '不支持该语种',
          },
      });
  }

  const {model, apiKeys, apiUrl, apiUrlPath} = $option;

  if (!apiKeys || typeof apiKeys !== 'string') {
    return query.onCompletion({
      error: {
        type: 'secretKey',
        message: '配置错误 - 未填写 API Keys',
        addtion: '请在插件配置中填写 API Keys',
      },
    });
  }

  const apiKeySelection = apiKeys.split(',').map((key) => key.trim()).filter(Boolean);

  if (!apiKeySelection.length) {
      return query.onCompletion({
          error: {
              type: 'secretKey',
              message: '配置错误 - 未填写 API Keys',
              addtion: '请在插件配置中填写 API Keys',
          },
      });
  }


  const apiKey =
    apiKeySelection[Math.floor(Math.random() * apiKeySelection.length)];

  const baseUrl = apiUrl || "https://api.openai.com";
  const urlPath = apiUrlPath || "/v1/chat/completions";

  const header = buildHeader(apiKey);
  const canStreamRequest = typeof $http !== 'undefined' && typeof $http.streamRequest === 'function' && typeof query.onStream === 'function';
  const body = buildRequestBody(model, query, canStreamRequest);

  (async () => {
    if (canStreamRequest) {
      let targetText = '';
      let completed = false;

      await $http.streamRequest({
        method: 'POST',
        url: baseUrl + urlPath,
        header,
        body,
        cancelSignal: query.cancelSignal,
        streamHandler: (streamData) => {
          const lines = streamData.text.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const parsedData = parseStreamData(trimmedLine);
            if (!parsedData) continue; // 如果解析不到数据则跳过

            if (parsedData.done) {
              if (completed) return;
              completed = true;
              query.onCompletion({
                result: {
                  from: query.detectFrom,
                  to: query.detectTo,
                  toParagraphs: [targetText],
                },
              });
              return;
            }

            if (parsedData.data) {
              const { text, finished } = handleResponse(query, targetText, parsedData.data);
              targetText = text;

              if (finished && !completed) {
                completed = true;
                query.onCompletion({
                  result: {
                    from: query.detectFrom,
                    to: query.detectTo,
                    toParagraphs: [targetText],
                  },
                });
              }
            }
          }
        },
        handler: (result) => {
          if (result.error || (result.response && result.response.statusCode >= 400)) {
            handleError(query, result);
          }
        },
      });
      return;
    }

    const requestOptions = {
      method: 'POST',
      url: baseUrl + urlPath,
      header,
      body,
    };

    if (query.cancelSignal) {
      // @ts-ignore - cancelSignal is not available in older Bob versions
      requestOptions.cancelSignal = query.cancelSignal;
    }

    const result = await $http.request(requestOptions);

    if (result.error || (result.response && result.response.statusCode >= 400)) {
      handleError(query, result);
      return;
    }

    let data = result.data;
    if (!data) {
      handleError(query, result);
      return;
    }

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (err) {
        $log.error(`Failed to parse response: ${data}`);
        handleError(query, result);
        return;
      }
    }

    try {
      const choices = data.choices || [];
      let targetText = '';

      const appendContent = (content) => {
        if (!content) return;
        if (typeof content === 'string') {
          targetText += content;
        } else if (Array.isArray(content)) {
          for (const item of content) {
            if (typeof item === 'string') {
              targetText += item;
            } else if (item && typeof item === 'object' && 'text' in item) {
              targetText += item.text;
            }
          }
        }
      };

      for (const choice of choices) {
        const message = choice.message;
        if (message) {
          appendContent(message.content);
        }

        const delta = choice.delta;
        if (delta) {
          appendContent(delta.content);
        }
      }

      if (!targetText && data.error) {
        handleError(query, { data, response: result.response });
        return;
      }

      query.onCompletion({
        result: {
          from: query.detectFrom,
          to: query.detectTo,
          toParagraphs: [targetText],
        },
      });
    } catch (err) {
      query.onCompletion({
        error: {
          type: err._type || 'param',
          message: err.message || '响应解析错误',
          // @ts-ignore
          addition: err._addition,
        },
      });
    }
  })().catch((err) => {
    query.onCompletion({
      error: {
        type: err._type || 'unknown',
        message: err._message || '未知错误',
        addtion: err._addition,
      },
    });
  });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
<h4 align="right">
  <strong>简体中文</strong> | <a href="https://github.com/jtsang4/bob-plugin-openaiapi/blob/main/docs/README_EN.md">English</a>
</h4>

<div>
  <h1 align="center">OpenAI Translator Bob Plugin</h1>
  <p align="center">
    <a href="https://github.com/jtsang4/bob-plugin-openaiapi/releases" target="_blank">
        <img src="https://github.com/jtsang4/bob-plugin-openaiapi/actions/workflows/release.yaml/badge.svg" alt="release">
    </a>
    <a href="https://github.com/jtsang4/bob-plugin-openaiapi/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/jtsang4/bob-plugin-openaiapi?style=flat">
    </a>
    <a href="https://github.com/jtsang4/bob-plugin-openaiapi/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/badge/openai-bob-orange?style=flat">
    </a>
    <a href="https://github.com/jtsang4/bob-plugin-openaiapi/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/badge/langurage-JavaScript-brightgreen?style=flat&color=blue">
    </a>
  </p>
</div>

## 简介

基于 [OpenAI API](https://platform.openai.com/docs/api-reference/introduction) 实现的 [Bob](https://bobtranslate.com/) 插件。拥有翻译、润色的功能，并支持自定义 Base URL、模型和提示词。

### 润色功能

支持使用 OpenAI API 对句子进行润色和语法修改，只需要把目标语言设置为与源语言一样即可。

### 语言模型

[模型简介](https://platform.openai.com/docs/models)
* `GPT-4o mini` (默认使用): 速度与成本最优的多用途模型
* `GPT-4o`: 更强大的旗舰模型
* `GPT-4.1 / GPT-4.1 mini`: 最新一代的多模态模型
* `o3-mini`: 强大的推理模型

## 使用方法

1. 安装 [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (版本 >= 0.50)，一款 macOS 平台的翻译和 OCR 软件

2. 下载此插件: [openai-translator.bobplugin](https://github.com/jtsang4/bob-plugin-openaiapi/releases/latest)

3. 安装此插件

4. 去 [OpenAI](https://platform.openai.com/api-keys) 获取你的 API KEY

5. 把 API KEY 填入 Bob 偏好设置 > 服务 > 此插件配置界面的 API KEY 的输入框中，可配置多个 Key、Base URL、模型以及自定义提示词

6. (可选) 安装 [PopClip](https://bobtranslate.com/guide/integration/popclip.html) 实现划词后鼠标附近出现悬浮图标

## 感谢

本仓库是在 [yetone](https://github.com/yetone) 优秀的 [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) 源码基础上的再次适配，感谢原作者的卓越贡献。

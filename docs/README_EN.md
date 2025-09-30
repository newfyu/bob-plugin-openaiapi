<h4 align="right">
  <a href="https://github.com/jtsang4/bob-plugin-openaiapi/blob/main/README.md">简体中文</a> | <strong>English</strong>
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

## Introduction

[Bob](https://bobtranslate.com/) plugin based on the [OpenAI API](https://platform.openai.com/docs/api-reference/introduction). It provides translation and polishing features, and supports custom base URLs, models, API keys, and prompts.

### Polishing

You can use the OpenAI API to polish and syntactically modify sentences by setting the target language to be the same as the source language.

### Language Model

[Model overview](https://platform.openai.com/docs/models)
* `GPT-4o mini` (default): Cost-efficient general purpose model
* `GPT-4o`: Flagship model for high quality results
* `GPT-4.1 / GPT-4.1 mini`: Latest multimodal models
* `o3-mini`: Advanced reasoning model

## Usage


1. Install [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (version >= 0.50), a translation and OCR software for the macOS platform

2. Download this plugin: [openai-translator.bobplugin](https://github.com/jtsang4/bob-plugin-openaiapi/releases/latest)

3. Install this plugin

4. Get your access key from [OpenAI](https://platform.openai.com/api-keys)

5. Enter the API KEY in Bob Preferences > Services > This plugin configuration interface's API KEY input box. You can configure multiple keys, base URLs, models, and custom prompts.

6. (Optional) Install [PopClip](https://bobtranslate.com/guide/integration/popclip.html) to achieve the floating icon appearing near the mouse after selecting words

## Thanks

This repository is again adapted from the excellent [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) by [yetone](https://github.com/yetone). Many thanks to the original author for the outstanding contribution.

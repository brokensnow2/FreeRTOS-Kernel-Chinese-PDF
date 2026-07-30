# 源码化翻译与 PDF 构建

本仓库正在从“直接编辑 PDF”迁移到“Markdown 作为唯一可维护源文件、PDF 作为构建产物”的工作流。

## 当前状态

- 当前稳定中文 PDF 仍对应 FreeRTOS Kernel Book V1.0。
- `upstream/` 固定保存官方 FreeRTOS Kernel Book V1.1.0 快照。
- `zh-CN/` 保存与上游章节同名的中文 Markdown。
- 当前已完成并启用第 1 至 2 章，用于验证翻译、协作、排版和自动构建流程。
- 完成全部章节并通过人工审阅前，不会用验证版替换当前稳定 PDF。

## 目录结构

| 路径 | 用途 |
| --- | --- |
| `upstream/` | 官方 V1.1.0 Markdown、媒体和许可文件的只读快照 |
| `upstream/upstream.lock.json` | 上游 Tag、Commit 和导入范围 |
| `zh-CN/` | 中文译文及构建配置 |
| `styles/book.css` | A4 PDF 排版、中文字体、代码和表格样式 |
| `scripts/` | 源文件校验、PDF 构建与产物校验 |
| `output/pdf/` | 本地生成的 PDF；不提交到 Git |

## 翻译规则

1. 只在 `zh-CN/` 中修改译文，不直接修改 `upstream/`。
2. 中文章节文件必须与对应的英文文件同名。
3. 保留英文源文件中的章节编号、代码块、图片引用、表格和 HTML 锚点。
4. 每个中文标题前保留由英文标题生成的稳定锚点，避免目录链接随译文调整而变化。
5. 一个 Pull Request 尽量只处理一个章节或一种明确的问题。
6. API 名称、标识符和可执行代码保持英文；C/C++ 代码中的解释性注释可以翻译，正文术语按项目约定统一。

`pnpm run verify` 会检查：

- 中文构建配置是否与固定的上游 Tag 和 Commit 一致。
- 中英文标题数量、层级和章节编号是否一致。
- 稳定锚点是否完整。
- 列表、代码块、表格、引用块、图片和外部链接是否与英文原文一致。
- 中文目录链接是否可以解析。

## 本地构建

需要 Node.js 20 或更高版本，以及 pnpm。

```sh
pnpm install
pnpm exec playwright install chromium
pnpm run preview
```

`pnpm run preview` 会依次完成源文件检查、PDF 构建和产物检查。Windows 用户也可以直接运行仓库根目录的 `build-pdf.cmd`。

日常翻译不需要修改 JavaScript。各脚本职责见 [scripts/README.md](../scripts/README.md)。

生成文件：

```text
output/pdf/Mastering-the-FreeRTOS-Real-Time-Kernel.V1.1.0.zh-CN.chapters-01-02-preview.pdf
```

在 Windows 上，如果 Playwright 没有安装 Chromium，构建脚本会尝试使用本机 Microsoft Edge 或 Google Chrome。也可以通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定浏览器。

## Pull Request 预览

修改 `upstream/`、`zh-CN/`、构建脚本或样式后，GitHub Actions 会：

1. 校验中英文源文件结构。
2. 安装 Chromium 和 Noto CJK 字体。
3. 构建当前已翻译章节的预览 PDF。
4. 检查 PDF 页数、文件头和文件大小。
5. 将 PDF 作为 Actions Artifact 保留 14 天，供维护者下载审阅。

## 同步上游

同步新版本时，应先更新 `upstream/` 快照，再审阅官方变更，最后修改 `upstream/upstream.lock.json`。不能仅修改版本号，也不能让自动翻译直接覆盖已经人工校正的中文内容。

后续会增加专用同步脚本和 Action，用于比较上游 Tag 或 Commit，并将变化按章节拆分为 Issue 或 Pull Request。

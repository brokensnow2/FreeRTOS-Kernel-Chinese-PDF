# 构建脚本说明

日常翻译和校对不需要修改本目录中的 JavaScript。译者主要编辑 `zh-CN/chXX.md`，构建时运行：

```sh
pnpm run preview
```

Windows 用户也可以直接运行仓库根目录的 `build-pdf.cmd`。

## 每个脚本的职责

| 文件 | 作用 | 通常需要修改吗 |
| --- | --- | --- |
| `book-utils.mjs` | 对照中英文 Markdown，检查标题、列表、代码、表格、图片和链接 | 不需要 |
| `markdown.mjs` | 配置 Markdown、脚注和代码语法高亮的解析方式 | 不需要 |
| `verify-book.mjs` | 启动源文件检查并打印结果 | 不需要 |
| `verify-code-fidelity.mjs` | 检查只翻译 C/C++ 注释，不改动可执行代码 | 不需要 |
| `verify-highlighting.mjs` | 检查代码着色不会改变代码文本 | 不需要 |
| `build-book.mjs` | 将中文 Markdown、图片和 CSS 交给 Chromium，生成 PDF | 不需要 |
| `verify-pdf.mjs` | 检查生成文件是否为有效 PDF，以及页数和大小是否合理 | 不需要 |

## 构建流程

```text
zh-CN/*.md
    |
    v
检查中英文结构和可执行代码一致性
    |
    v
Markdown 转 HTML
    |
    v
应用 styles/book.css
    |
    v
Chromium 打印为 PDF
    |
    v
检查 PDF
```

## 增加新章节时需要改什么

1. 新建对应的 `zh-CN/chXX.md`。
2. 在 `zh-CN/book.json` 的 `files` 和 `chapters` 中加入该文件。
3. 更新 `zh-CN/toc.md`。
4. 运行 `pnpm run preview`。

构建脚本只有在 PDF 生成方式、校验规则或排版系统需要变化时才需要修改。C/C++ 代码块允许翻译注释正文，但注释之外的内容必须与上游一致；终端输出等其他代码块仍需逐字一致。显式标注为 C、C++ 或 Shell 的代码块会进行语法高亮；终端输出、目录树和未标注语言的代码块保持纯文本样式。

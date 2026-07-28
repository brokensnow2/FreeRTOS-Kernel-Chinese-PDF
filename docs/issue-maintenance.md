# Issue 维护流程

本仓库采用“AI 辅助维护，人工决策合并”的 issue 流程。AI 可以留下维护参考注释和标准化 AI 评估标签，但不代表维护者正式回复，也不会自动关闭 issue。

## 推荐流程

1. 新 issue 进入仓库。
2. Issue 模板引导报告者提供页码、截图、原文位置或建议译法。
3. 维护者给 issue 添加 `request ai triage` 标签，或手动运行 `AI issue triage` workflow。
4. AI triage workflow 发布一条维护辅助注释，并添加标准化 `ai:...` 评估标签。
5. 维护者根据注释和 issue 内容决定后续处理方式。
6. 小而明确的问题可以分配给 Copilot/Codex 等 coding agent 尝试开 PR。
7. AI 无法可靠完成的大任务回退给真实贡献者或维护者处理。

## AI 可以做什么

- 判断 issue 属于翻译、错字、排版、书签、代码清单、上游版本或普通问题。
- 判断是否缺少页码、截图、英文原文、期望效果等信息。
- 给出建议标签。
- 标记小任务是否适合 AI 先尝试 PR。
- 对宽泛或高风险任务标记 `status: human-needed`、`help wanted` 或 `expert-needed`。

## AI 不做什么

- 不代表维护者正式回复。
- 不承诺路线、发布时间或是否接受建议。
- 不自动关闭 issue。
- 不自动 assign 真实贡献者。
- 不直接处理整本 PDF 重译、上游大版本同步等宽泛任务。

## 标签约定

- `type: typo`：错字、标点、明显文字错误。
- `type: translation`：翻译错误、漏翻、术语不一致。
- `type: layout`：PDF 排版、图片、表格、代码清单显示问题。
- `type: bookmark`：目录、书签、页码跳转问题。
- `type: code-listing`：示例代码清单缺失、被翻译或格式损坏。
- `type: upstream-version`：上游英文版本同步、版本路线相关问题。
- `type: question`：使用、流程、项目计划类问题。
- `type: docs`：README、贡献说明、发布说明等文档问题。
- `status: needs-info`：需要报告者补充信息。
- `status: triaged`：已完成初步分类。
- `status: ai-candidate`：范围明确，适合 AI 先尝试开 PR。
- `status: human-needed`：需要维护者或真实贡献者判断/处理。
- `status: blocked`：暂时无法继续推进。
- `status: accepted`：维护者已接受该问题或建议。
- `help wanted`：欢迎真实贡献者接手。
- `good first issue`：适合首次贡献者。
- `expert-needed`：需要熟悉 FreeRTOS、PDF 排版或翻译校对的贡献者。

## 启用 AI triage

1. 不需要提交或配置外部 API key。
2. `AI issue triage` workflow 使用 GitHub Models，因此 workflow 权限中包含 `models: read`。
3. 手动运行 `Sync labels` workflow，先把 `.github/labels.json` 中的标签同步到仓库。
4. 需要 AI 辅助判断时，给 issue 添加 `request ai triage` 标签。
5. 也可以手动运行 `AI issue triage` workflow，并输入 issue 编号。
6. AI 输出只作为维护者参考注释；真正回复、关闭、分派和路线判断仍由维护者完成。

## 处理建议

- 错字、单句翻译、书签 XML、README 小修：可标记 `status: ai-candidate`。
- 需要对照英文 PDF 的翻译判断：优先 `status: human-needed`，必要时加 `expert-needed`。
- 上游 v1.1.0 同步、整本 PDF 重做、发布策略：使用 tracking issue，由维护者拆分任务。

<a id="table-of-contents"></a>

# 目录

<p class="toc-chapter"><a href="ch01.md#1-preface">1 前言</a></p>

- [1.1 小型嵌入式系统中的多任务处理](ch01.md#11-multitasking-in-small-embedded-systems)
  - [1.1.1 关于 FreeRTOS 内核](ch01.md#111-about-the-freertos-kernel)
  - [1.1.2 价值主张](ch01.md#112-value-proposition)
  - [1.1.3 关于术语的说明](ch01.md#113-a-note-about-terminology)
  - [1.1.4 为什么使用 RTOS？](ch01.md#114-why-use-an-rtos)
  - [1.1.5 FreeRTOS 内核的功能](ch01.md#115-freertos-kernel-features)
  - [1.1.6 许可，以及 FreeRTOS、OpenRTOS 和 SafeRTOS 产品系列](ch01.md#116-licensing-and-the-freertos-openrtos-and-safertos-family)
- [1.2 随书提供的源文件和项目](ch01.md#12-included-source-files-and-projects)
  - [1.2.1 获取本书配套示例](ch01.md#121-obtaining-the-examples-that-accompany-this-book)

<p class="toc-chapter"><a href="ch02.md#2-the-freertos-kernel-distribution">2 FreeRTOS 内核发行版</a></p>

- [2.1 简介](ch02.md#21-introduction)
- [2.2 了解 FreeRTOS 发行版](ch02.md#22-understanding-the-freertos-distribution)
  - [2.2.1 定义：FreeRTOS 移植版本](ch02.md#221-definition-freertos-port)
  - [2.2.2 构建 FreeRTOS](ch02.md#222-building-freertos)
  - [2.2.3 FreeRTOSConfig.h](ch02.md#223-freertosconfigh)
  - [2.2.4 官方发行版](ch02.md#224-official-distributions)
  - [2.2.5 所有移植版本通用的 FreeRTOS 源文件](ch02.md#225-freertos-source-files-common-to-all-ports)
  - [2.2.6 特定于移植版本的 FreeRTOS 源文件](ch02.md#226-freertos-source-files-specific-to-a-port)
  - [2.2.7 头文件搜索路径](ch02.md#227-include-paths)
  - [2.2.8 头文件](ch02.md#228-header-files)
- [2.3 演示应用](ch02.md#23-demo-applications)
- [2.4 创建 FreeRTOS 项目](ch02.md#24-creating-a-freertos-project)
  - [2.4.1 修改随附的演示项目](ch02.md#241-adapting-one-of-the-supplied-demo-projects)
  - [2.4.2 从零创建新项目](ch02.md#242-creating-a-new-project-from-scratch)
- [2.5 数据类型和编码风格指南](ch02.md#25-data-types-and-coding-style-guide)
  - [2.5.1 数据类型](ch02.md#251-data-types)
  - [2.5.2 变量命名](ch02.md#252-variable-names)
  - [2.5.3 函数命名](ch02.md#253-function-names)
  - [2.5.4 格式](ch02.md#254-formatting)
  - [2.5.5 宏命名](ch02.md#255-macro-names)
  - [2.5.6 大量类型转换的原因](ch02.md#256-rationale-for-excessive-type-casting)

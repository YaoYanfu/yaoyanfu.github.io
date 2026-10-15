// Homepage selections and the full project page share this bilingual catalogue.
const projects = [
  {
    id: 'xdu-zhixing',
    featured: true,
    title: {zh: 'XDU-Zhixing', en: 'XDU-Zhixing'},
    category: {zh: 'Agent 系统', en: 'Agent Systems'},
    description: {
      zh: '面向校园场景的 AI 项目，重点工作是开发支撑 Agent 运行的 Harness。',
      en: 'An AI project for campus scenarios, with my work focused on the harness that supports agent execution.',
    },
    role: {zh: 'Harness 主要开发者', en: 'Primary Harness Developer'},
    tags: ['AI Agents', 'Harness', 'Python', 'FastAPI'],
    closedSource: true,
    details: [
      {
        id: 'overview',
        title: {zh: '项目概述', en: 'Overview'},
        paragraphs: [{
          zh: 'XDU-Zhixing 是面向西电校园场景的 AI 平台，连接校园资料、信息检索与社区内容。网页与微信小程序共用业务后端，Agent Harness 为应用提供模型执行与工具调用能力。',
          en: 'XDU-Zhixing is an AI platform for the Xidian campus, connecting campus information, search, and community content. Its web app and WeChat mini program share a backend, with an agent harness providing model execution and tool use.',
        }],
      },
      {
        id: 'contribution',
        title: {zh: '我的职责', en: 'My Contribution'},
        paragraphs: [{
          zh: '我是 Harness 的主要开发者，工作重点是模型执行、工具调用、会话上下文组织，以及 Harness 与业务后端的集成。',
          en: 'As the primary harness developer, my work focuses on model execution, tool calling, conversation context, and integration with the application backend.',
        }],
      },
      {
        id: 'capabilities',
        title: {zh: 'Harness 能力', en: 'Harness Capabilities'},
        items: [
          {zh: '检索与读取：检索校园资料、网页和学术题录，读取相关原文，并按用户可见范围使用社区内容。', en: 'Search and reading: retrieve campus information, web pages, and academic records; read relevant sources and use community content within the user’s access scope.'},
          {zh: '可追溯引用：将回答中的引用绑定到实际读取的来源，并在输出过程中复核资料状态与访问资格。', en: 'Traceable citations: connect answers to sources actually read, with checks on source availability and access during response generation.'},
          {zh: '流式与结构化展示：输出文本、工具过程和状态，支持来源列表、分步指南与服务入口卡片。', en: 'Streaming and structured presentation: deliver text, tool activity, and status updates, with source lists, step-by-step guides, and service cards.'},
          {zh: '运行与会话管理：处理历史上下文预算、超时、取消和并发，并保存问答、来源与执行轨迹。', en: 'Execution and conversation management: handle history budgets, timeouts, cancellation, and concurrency, while persisting messages, sources, and execution traces.'},
        ],
      },
      {
        id: 'focus',
        title: {zh: '工程关注', en: 'Engineering Focus'},
        paragraphs: [{
          zh: '围绕真实校园问题，将检索、模型和工具组织成可用的问答流程，持续关注来源可靠性、响应体验和权限边界。项目仍在开发中。',
          en: 'The focus is on turning retrieval, models, and tools into useful workflows for campus questions, with attention to source reliability, response experience, and access boundaries. Development is ongoing.',
        }],
      },
    ],
    github: null,
    demo: null,
    status: 'WIP',
  },
  {
    id: 'project-chie',
    featured: true,
    title: {zh: 'Project CHIE', en: 'Project CHIE'},
    category: {zh: 'AI 伙伴探索', en: 'AI Companion Exploration'},
    description: {
      zh: '基于 MaiBot 修改开发的 AI 伙伴项目，围绕长期交互中的记忆、上下文管理与行为一致性展开探索。',
      en: 'An AI companion project built on MaiBot, exploring memory, context management, and behavioral consistency across long-term interactions.',
    },
    tags: ['AI Agents', 'Memory', 'FastAPI'],
    details: [
      {
        id: 'overview',
        title: {zh: '项目概述', en: 'Overview'},
        paragraphs: [{
          zh: 'Project CHIE 是基于开源 MaiBot 修改开发的 AI 伙伴项目。它从群聊与私聊中的长期交互出发，探索一个 Agent 如何利用历史对话、记忆与上下文，保持相对连贯的行为。',
          en: 'Project CHIE is an AI companion project built on the open-source MaiBot. Starting from long-term interactions in group and private chats, it explores how an agent can use conversation history, memory, and context to maintain coherent behavior.',
        }],
      },
      {
        id: 'architecture',
        title: {zh: '系统组成', en: 'System Components'},
        items: [
          {zh: '推理与工具：通过 Planner–Replyer 两阶段组织回应决策与内容生成，连接记忆查询、回复与消息等工具。', en: 'Reasoning and tools: a Planner–Replyer workflow separates response decisions from generation and connects tools for memory lookup, replies, and messaging.'},
          {zh: '记忆与检索：围绕对话记录和用户资料组织持久化记忆，组合语义向量与关系检索。', en: 'Memory and retrieval: persistent memory organizes conversation records and user information, combining semantic vector search with relational retrieval.'},
          {zh: '交互与维护：包含平台消息接入、插件运行时、FastAPI 后端和 React Web 管理台，方便观察与调整系统行为。', en: 'Interaction and maintenance: platform messaging, a plugin runtime, a FastAPI backend, and a React dashboard support observing and adjusting system behavior.'},
        ],
      },
      {
        id: 'exploration',
        title: {zh: '持续探索', en: 'Ongoing Exploration'},
        paragraphs: [{
          zh: '当前关注长期交互中的记忆组织、上下文管理与行为一致性。后续计划探索 chie-core 与 chie-body 的分离，将推理和记忆与平台或物理交互解耦；具身交互目前属于后续方向。',
          en: 'Current interests include memory organization, context management, and behavioral consistency over time. Future plans explore separating chie-core from chie-body to decouple reasoning and memory from platform or physical interaction; embodied interaction remains a future direction.',
        }, {
          zh: '项目保留 MaiBot 的上游署名。这里介绍的是当前仓库的系统组成与探索方向，具体实现和上游声明可通过下方链接查看。',
          en: 'The project preserves attribution to MaiBot. This overview describes the current repository and its research directions; implementation details and upstream attribution are available through the links below.',
        }],
      },
    ],
    resources: [
      {label: {zh: '项目说明', en: 'Project Overview'}, href: 'https://github.com/YaoYanfu/project-chie#readme'},
      {label: {zh: '上游项目 MaiBot', en: 'Upstream MaiBot'}, href: 'https://github.com/Mai-with-u/MaiBot'},
    ],
    github: 'https://github.com/YaoYanfu/project-chie',
    demo: null,
    status: 'WIP',
  },
  {
    id: 'shallowseek',
    title: {zh: 'XDWe / shallowseek', en: 'XDWe / shallowseek'},
    category: {zh: 'AI 学习系统', en: 'AI Learning System'},
    description: {
      zh: '西电教师增强型 AI 学习系统，基于 RAG 整合课程资源与知识流，支持智能问答与学习辅助。',
      en: 'A teacher-augmented AI learning system for Xidian University, using RAG to connect course resources and knowledge for question answering and learning support.',
    },
    tags: ['Python', 'RAG', 'LLM', 'FastAPI'],
    github: 'https://github.com/YaoYanfu/shallowseek',
    demo: null,
    status: 'Active',
  },
  {
    id: 'disease-identification',
    title: {zh: '农作物病虫害识别（PlantVillage CNN）', en: 'Crop Disease Identification (PlantVillage CNN)'},
    category: {zh: '深度学习实践', en: 'Deep Learning'},
    description: {
      zh: '端到端深度学习实践：从零训练 CNN 识别 PlantVillage 38 类作物病害，并通过 FastAPI 与前端界面提供本地推理。',
      en: 'An end-to-end deep learning project: training a CNN from scratch to classify 38 PlantVillage crop disease categories, with local inference through FastAPI and a web interface.',
    },
    tags: ['Python', 'TensorFlow', 'CNN', 'FastAPI'],
    github: 'https://github.com/YaoYanfu/disease-identification',
    demo: null,
    status: 'Active',
  },
  {
    id: 'picogk-packaging',
    title: {zh: 'PicoGK 三维包装设计', en: 'PicoGK 3D Packaging Design'},
    category: {zh: '计算设计', en: 'Computational Design'},
    description: {
      zh: '基于 PicoGK 的计算几何三维包装设计项目，探索程序化生成与工程设计的交叉应用。',
      en: 'A computational geometry project using PicoGK for 3D packaging design, exploring procedural generation in engineering design.',
    },
    tags: ['C#', 'PicoGK', 'Computational Design'],
    github: 'https://github.com/YaoYanfu/PicoGK-Three-dimensional-packaging-design',
    demo: null,
    status: 'WIP',
  },
  {
    id: 'math-modeling',
    title: {zh: '数学建模校赛', en: 'Mathematical Modeling Competition'},
    category: {zh: '数学建模', en: 'Mathematical Modeling'},
    description: {
      zh: '数学建模校赛项目记录：脚本、数据清洗、可视化、模型构建与方案输出。',
      en: 'Work from a university mathematical modeling competition, including data cleaning, visualization, modeling, and reporting.',
    },
    tags: ['Python', 'Modeling', 'Visualization'],
    github: 'https://github.com/YaoYanfu/Mathematical-Modeling-School-Competition',
    demo: null,
    status: 'Archived',
  },
  {
    id: 'my-notebook',
    title: {zh: "Yves' Notebook", en: "Yves' Notebook"},
    category: {zh: '个人网站', en: 'Personal Website'},
    description: {
      zh: '基于 Docusaurus 与 React 构建的个人网站，展示研究、项目和博客，支持中英文切换，并包含自研 CHIE 看板娘。',
      en: 'A personal website built with Docusaurus and React for research, projects, and writing, with bilingual content and a custom CHIE mascot.',
    },
    tags: ['Docusaurus', 'React', 'CSS Animation'],
    github: 'https://github.com/YaoYanfu/yaoyanfu.github.io',
    demo: 'https://yaoyanfu.github.io',
    status: 'Active',
  },
  {
    id: 'xuezaixidian-signin',
    title: {zh: '学在西电签到工具', en: 'XueZaiXidian Sign-in Tool'},
    category: {zh: '自动化工具', en: 'Automation'},
    description: {
      zh: '超星学习通签到脚本，通过 HTTP 客户端支持位置签到与二维码签到。',
      en: 'An HTTP-client-based sign-in script for Chaoxing Learning, supporting location and QR-code check-ins.',
    },
    tags: ['Node.js', 'Automation', 'Reverse Engineering'],
    github: 'https://github.com/YaoYanfu/xuezaixidian-signin',
    demo: null,
    status: 'Active',
  },
];

export default projects;

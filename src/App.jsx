import { useState } from "react";

// ─── Book Types ───────────────────────────────────────────────────────────────

const BOOK_TYPES = [
  {
    id: "magazine",
    label: "建筑杂志",
    sub: "作品案例 · 评论",
    icon: "◈",
    color: "#C8A96E",
    dimensions: [
      { id: "project",   label: "项目档案",  desc: "名称、建筑师、地点、年份、类型",   words: { compact: "结构化字段填满即可", standard: "结构化字段填满即可", deep: "字段 + 项目背景补充" } },
      { id: "concept",   label: "设计概念",  desc: "核心理念与生成逻辑",               words: { compact: "50字以内，核心句为主", standard: "核心句1句+展开3-5句，150字以内", deep: "200字以内，可引用建筑师原话" } },
      { id: "space",     label: "空间叙事",  desc: "空间体验与序列分析",               words: { compact: "50字以内，关键词为主", standard: "150-200字，允许描述性语言", deep: "300字以内，完整空间序列" } },
      { id: "material",  label: "材料语言",  desc: "材料选择与建构表达",               words: { compact: "30字以内，列举为主", standard: "100字以内，术语精准", deep: "150字以内，含构造逻辑" } },
      { id: "context",   label: "文脉回应",  desc: "场地、城市、历史关系",             words: { compact: "50字以内", standard: "100-150字", deep: "200字以内，含城市尺度" } },
      { id: "theory",    label: "理论关联",  desc: "隐含的建筑思想谱系",               words: { compact: "关键词3个以内", standard: "关键词+一句说明，80字以内", deep: "150字以内，含思想溯源" } },
    ],
    listPrompt: () =>
`你是一位建筑学研究助手。请对我上传的这期建筑杂志进行内容普查，输出一份结构化清单。

## 输出内容

### 案例清单
列出本期所有建筑项目，每项包含：
- 序号 / 项目名称 / 建筑师或事务所 / 项目类型 / 地点 / 竣工年份（如有）

### 文章与评论清单
列出所有非案例内容（理论文章、访谈、评论）：
- 标题 / 作者 / 核心议题（一句话）

### 编辑主题
这期杂志是否有隐性的策展主题？用1-2句话概括。

请以清单格式输出，简洁清晰。`,

    deepPrompt: (dims, precision) => {
      const w = (id) => dims.find(d => d.id === id)?.words[precision] || "";
      const totals = { compact: "200-300字", standard: "600-800字", deep: "1200-1500字" };
      return `你是一位建筑学研究助手。请对指定的单个建筑案例进行深度解析，生成一条完整的知识库条目。

> 请告知案例名称，我将开始解析。

---

## 解析框架

${dims.find(d=>d.id==="project") ? `### 【项目档案】（${w("project")}）
- 项目名称 / 建筑师或事务所 / 项目类型 / 规模
- 地点 / 竣工年份 / 业主（如有）
- 项目缘起或背景（如有）\n\n` : ""}${dims.find(d=>d.id==="concept") ? `### 【设计概念】（${w("concept")}）
- 用一句话提炼核心设计概念
- 概念的生成逻辑：场地回应？功能回应？哲学表达？
- 建筑师自述中的关键词（尽量引用原文）\n\n` : ""}${dims.find(d=>d.id==="space") ? `### 【空间叙事】（${w("space")}）
- 空间序列组织：入口 → 过渡 → 核心空间
- 光线、高度、比例等感知要素的运用
- 值得记录的空间体验特征\n\n` : ""}${dims.find(d=>d.id==="material") ? `### 【材料语言】（${w("material")}）
- 主要材料及选择理由
- 材料与设计概念的呼应关系
- 特殊构造方式或细部处理\n\n` : ""}${dims.find(d=>d.id==="context") ? `### 【文脉回应】（${w("context")}）
- 建筑与场地/城市环境的关系
- 对历史、文化或气候条件的回应策略
- 边界与公共性的处理\n\n` : ""}${dims.find(d=>d.id==="theory") ? `### 【理论关联】（${w("theory")}）
- 折射出的建筑理论或思想流派
- 与哪些建筑师或运动存在对话？
- 2-3个知识库标签关键词\n\n` : ""}---

## 输出要求
- 每个维度单独成段，用【】标题区分
- 关键概念词汇加粗
- 末尾附「知识标签」：5-8个可检索关键词
- 单案例总字数控制在 **${totals[precision]}** 以内`;
    },
  },

  {
    id: "monograph",
    label: "建筑师专论",
    sub: "作品集 · 哲学 · 生涯",
    icon: "◉",
    color: "#8BA888",
    dimensions: [
      { id: "bio",       label: "生平与背景",  desc: "成长、教育、思想形成背景",     words: { compact: "50字以内", standard: "100-150字", deep: "200字以内" } },
      { id: "philosophy",label: "建筑哲学",    desc: "核心理念、宣言、世界观",       words: { compact: "80字以内，关键词为主", standard: "200字以内，含演变脉络", deep: "300字以内，含思想来源" } },
      { id: "works",     label: "代表作分析",  desc: "作品如何折射设计哲学",         words: { compact: "每作品50字", standard: "每作品150字", deep: "每作品250字" } },
      { id: "evolution", label: "风格演变",    desc: "不同时期的设计转变",           words: { compact: "分期列举", standard: "100-150字，含转折点", deep: "200字以内，含外部影响" } },
      { id: "influence", label: "影响与传承",  desc: "对建筑界的影响与历史地位",     words: { compact: "50字以内", standard: "100字以内", deep: "150字以内" } },
      { id: "theory",    label: "理论谱系",    desc: "与其他建筑师/流派的关系",      words: { compact: "关键词3个", standard: "关键词+说明，80字", deep: "150字以内" } },
    ],
    listPrompt: () =>
`你是一位建筑学研究助手。请对我上传的这本建筑师专论/作品集进行内容普查。

## 输出内容

### 基本信息
- 建筑师姓名 / 国籍 / 活跃年代
- 本书作者 / 出版年份 / 全书结构概述

### 收录作品清单
列出书中所有建筑作品：
- 序号 / 作品名称 / 地点 / 年份 / 类型

### 章节与文章清单
- 章节名称 / 核心议题（一句话）

### 全书核心主题
用2-3句话概括这本书试图呈现的建筑师形象或论点。

请以清单格式输出。`,

    deepPrompt: (dims, precision) => {
      const w = (id) => dims.find(d => d.id === id)?.words[precision] || "";
      const totals = { compact: "300-400字", standard: "700-900字", deep: "1500字以内" };
      return `你是一位建筑学研究助手。请基于这本建筑师专论，对指定内容进行深度解析，生成知识库条目。

> 请告知需要解析的内容（某件作品 / 某个章节 / 某一时期），我将开始解析。

---

## 解析框架

${dims.find(d=>d.id==="bio") ? `### 【生平与背景】（${w("bio")}）
- 成长环境与教育背景
- 对其建筑观影响最深的经历或事件\n\n` : ""}${dims.find(d=>d.id==="philosophy") ? `### 【建筑哲学】（${w("philosophy")}）
- 核心建筑理念是什么？用一句话概括
- 这一哲学如何形成？有哪些重要影响来源？
- 建筑师自述中反复出现的关键词或宣言\n\n` : ""}${dims.find(d=>d.id==="works") ? `### 【代表作分析】（${w("works")}）
- 这件作品如何体现其建筑哲学？
- 与其他作品的异同
- 在其生涯中的位置与意义\n\n` : ""}${dims.find(d=>d.id==="evolution") ? `### 【风格演变】（${w("evolution")}）
- 不同时期的设计特征
- 关键转折点与影响因素\n\n` : ""}${dims.find(d=>d.id==="influence") ? `### 【影响与传承】（${w("influence")}）
- 对同时代及后世建筑师的影响
- 在建筑史中的地位与评价\n\n` : ""}${dims.find(d=>d.id==="theory") ? `### 【理论谱系】（${w("theory")}）
- 与哪些思想流派或建筑师存在传承/对话关系？
- 2-3个知识库标签关键词\n\n` : ""}---

## 输出要求
- 每个维度单独成段，用【】标题区分
- 关键词加粗
- 末尾附「知识标签」：5-8个关键词
- 总字数控制在 **${totals[precision]}** 以内`;
    },
  },

  {
    id: "theory",
    label: "建筑理论",
    sub: "批评 · 宣言 · 思想",
    icon: "◇",
    color: "#9E8FB2",
    dimensions: [
      { id: "thesis",    label: "核心论点",   desc: "书的中心主张与问题意识",         words: { compact: "50字以内", standard: "150字以内", deep: "250字以内，含论证路径" } },
      { id: "concepts",  label: "关键概念",   desc: "作者建构的核心术语与定义",       words: { compact: "列举为主", standard: "每概念50字说明", deep: "每概念100字+举例" } },
      { id: "critique",  label: "批评对象",   desc: "批判的思潮、人物、建筑现象",     words: { compact: "列举即可", standard: "100字以内", deep: "150字以内" } },
      { id: "method",    label: "论述方法",   desc: "作者的研究与论证方式",           words: { compact: "30字以内", standard: "80字以内", deep: "150字以内" } },
      { id: "impact",    label: "历史影响",   desc: "对建筑理论界的影响与争议",       words: { compact: "50字以内", standard: "100字以内", deep: "150字以内" } },
      { id: "apply",     label: "实践关联",   desc: "理论如何在建筑实践中体现",       words: { compact: "举例1-2个", standard: "举例2-3个，各50字", deep: "举例3-5个，各100字" } },
    ],
    listPrompt: () =>
`你是一位建筑学研究助手。请对我上传的这本建筑理论书籍进行内容普查。

## 输出内容

### 基本信息
- 书名 / 作者 / 出版年份
- 全书章节结构（章节名称列表）

### 核心议题概览
用3-5句话概括这本书的核心问题意识和主要主张。

### 关键概念清单
列出书中作者明确建构或反复使用的核心术语（10-15个），每个附一句简要说明。

### 批评对象清单
书中主要批判或回应的思想、人物、建筑现象。

请以清单格式输出。`,

    deepPrompt: (dims, precision) => {
      const w = (id) => dims.find(d => d.id === id)?.words[precision] || "";
      const totals = { compact: "300-400字", standard: "600-800字", deep: "1200-1500字" };
      return `你是一位建筑学研究助手。请对这本建筑理论书籍的指定章节或议题进行深度解析。

> 请告知需要解析的章节或议题，我将开始解析。

---

## 解析框架

${dims.find(d=>d.id==="thesis") ? `### 【核心论点】（${w("thesis")}）
- 这一章节/议题的中心主张是什么？
- 作者试图回答什么问题？
- 论证的基本路径\n\n` : ""}${dims.find(d=>d.id==="concepts") ? `### 【关键概念】（${w("concepts")}）
- 本章出现的核心术语及作者的定义
- 这些概念与其他理论家的异同\n\n` : ""}${dims.find(d=>d.id==="critique") ? `### 【批评对象】（${w("critique")}）
- 作者批判或回应的对象是谁/什么？
- 批评的核心理由\n\n` : ""}${dims.find(d=>d.id==="method") ? `### 【论述方法】（${w("method")}）
- 作者如何论证？（历史分析、案例举证、哲学演绎等）
- 论述方式的特点与局限\n\n` : ""}${dims.find(d=>d.id==="impact") ? `### 【历史影响】（${w("impact")}）
- 这一论点在建筑理论界引发了什么反响？
- 支持者与反对者的立场\n\n` : ""}${dims.find(d=>d.id==="apply") ? `### 【实践关联】（${w("apply")}）
- 这一理论在哪些建筑作品中可以找到对应？
- 举例说明理论与实践的映射关系\n\n` : ""}---

## 输出要求
- 每个维度单独成段，用【】标题区分
- 关键词加粗
- 末尾附「知识标签」：5-8个关键词
- 总字数控制在 **${totals[precision]}** 以内`;
    },
  },

  {
    id: "structure",
    label: "结构／构造",
    sub: "材料 · 建构 · 技术",
    icon: "◫",
    color: "#7EB3C8",
    dimensions: [
      { id: "system",    label: "结构体系",   desc: "结构类型与受力逻辑",             words: { compact: "类型+关键词", standard: "100字以内，含受力逻辑", deep: "200字以内，含计算原理" } },
      { id: "material",  label: "材料特性",   desc: "材料性能、适用场景与局限",       words: { compact: "列举为主", standard: "每材料50-80字", deep: "每材料100-150字" } },
      { id: "detail",    label: "构造细部",   desc: "节点、连接、界面的处理方式",     words: { compact: "关键词列举", standard: "100字以内", deep: "200字以内，含图示描述" } },
      { id: "relation",  label: "结构与形式", desc: "结构逻辑如何影响建筑形态",       words: { compact: "50字以内", standard: "100-150字", deep: "200字以内，含案例" } },
      { id: "case",      label: "工程案例",   desc: "书中引用的典型工程案例",         words: { compact: "项目名+特点", standard: "每案例100字", deep: "每案例200字" } },
      { id: "innovation",label: "技术创新",   desc: "新材料、新工艺、新结构体系",     words: { compact: "列举为主", standard: "100字以内", deep: "200字以内，含应用前景" } },
    ],
    listPrompt: () =>
`你是一位建筑学研究助手。请对我上传的这本结构/构造/材料技术书籍进行内容普查。

## 输出内容

### 基本信息
- 书名 / 作者 / 出版年份
- 全书章节结构

### 核心议题概览
这本书主要讲解哪些结构体系或材料类型？覆盖范围如何？用3-5句话概括。

### 结构体系/材料类型清单
列出书中涉及的所有主要结构体系或材料类型。

### 工程案例清单
列出书中引用的典型工程案例：
- 项目名称 / 建筑师 / 地点 / 年份 / 主要结构特点（一句话）

请以清单格式输出。`,

    deepPrompt: (dims, precision) => {
      const w = (id) => dims.find(d => d.id === id)?.words[precision] || "";
      const totals = { compact: "200-300字", standard: "600-800字", deep: "1200字以内" };
      return `你是一位建筑学研究助手。请对这本结构/构造书籍中的指定章节或技术议题进行深度解析。

> 请告知需要解析的结构体系、材料类型或章节，我将开始解析。

---

## 解析框架

${dims.find(d=>d.id==="system") ? `### 【结构体系】（${w("system")}）
- 结构类型与基本受力逻辑
- 适用场景与典型跨度范围
- 主要优势与局限性\n\n` : ""}${dims.find(d=>d.id==="material") ? `### 【材料特性】（${w("material")}）
- 材料的力学性能（强度、刚度、延性等）
- 适用场景与建构方式
- 与其他材料的比较\n\n` : ""}${dims.find(d=>d.id==="detail") ? `### 【构造细部】（${w("detail")}）
- 关键节点的处理方式
- 连接逻辑与界面构造
- 施工要点或精度要求\n\n` : ""}${dims.find(d=>d.id==="relation") ? `### 【结构与形式】（${w("relation")}）
- 这种结构体系如何影响或限定建筑形态？
- 结构逻辑与建筑表达的关系\n\n` : ""}${dims.find(d=>d.id==="case") ? `### 【工程案例】（${w("case")}）
- 书中引用的典型工程案例
- 案例如何体现该结构体系的特性？\n\n` : ""}${dims.find(d=>d.id==="innovation") ? `### 【技术创新】（${w("innovation")}）
- 书中介绍的新材料、新工艺或新体系
- 创新点及应用前景\n\n` : ""}---

## 输出要求
- 每个维度单独成段，用【】标题区分
- 技术术语加粗
- 末尾附「知识标签」：5-8个可检索关键词
- 总字数控制在 **${totals[precision]}** 以内`;
    },
  },
];

const PRECISION_OPTIONS = [
  { id: "compact",  label: "精简", sub: "批量处理 · 快速归档" },
  { id: "standard", label: "标准", sub: "日常积累 · 均衡深度" },
  { id: "deep",     label: "深度", sub: "重点文献 · 精读存档" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ArchPromptGenerator() {
  const [typeId, setTypeId]         = useState("magazine");
  const [promptTab, setPromptTab]   = useState("list");   // "list" | "deep"
  const [precision, setPrecision]   = useState("standard");
  const [selections, setSelections] = useState(() =>
    BOOK_TYPES.find(t => t.id === "magazine").dimensions.map(d => d.id)
  );
  const [generated, setGenerated]   = useState("");
  const [copied, setCopied]         = useState(false);
  const [animating, setAnimating]   = useState(false);

  const currentType = BOOK_TYPES.find(t => t.id === typeId);

  const switchType = (id) => {
    setTypeId(id);
    setSelections(BOOK_TYPES.find(t => t.id === id).dimensions.map(d => d.id));
    setGenerated("");
  };

  const toggleDim = (id) =>
    setSelections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  const generate = () => {
    setAnimating(true);
    setTimeout(() => {
      const activeDims = currentType.dimensions.filter(d => selections.includes(d.id));
      const prompt =
        promptTab === "list"
          ? currentType.listPrompt()
          : currentType.deepPrompt(activeDims, precision);
      setGenerated(prompt);
      setAnimating(false);
    }, 320);
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const c = currentType.color;
  const bg    = "#0F0E0C";
  const panel = "#141210";
  const card  = "#1A1814";
  const border = "#252320";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Georgia, serif", color: "#E0D8C8" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "26px 36px 20px", display: "flex", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.35em", color: c, textTransform: "uppercase", marginBottom: "5px" }}>
            建筑文献知识库工具
          </div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "400", letterSpacing: "0.06em", color: "#F0E8D8" }}>
            NotebookLM 提示词生成器
          </h1>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "9px", color: "#2A2820", letterSpacing: "0.25em" }}>
          ARCH · KNOWLEDGE
        </div>
      </div>

      <div style={{ padding: "26px 36px", maxWidth: "860px" }}>

        {/* ── Step 1: Book Type ── */}
        <section style={{ marginBottom: "26px" }}>
          <Label>01 · 文献类型</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {BOOK_TYPES.map(t => (
              <button key={t.id} onClick={() => switchType(t.id)} style={{
                background: typeId === t.id ? card : panel,
                border: typeId === t.id ? `1px solid ${t.color}55` : `1px solid ${border}`,
                padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.18s",
              }}>
                <div style={{ fontSize: "15px", color: typeId === t.id ? t.color : "#4A4438", marginBottom: "5px" }}>{t.icon}</div>
                <div style={{ fontSize: "12px", color: typeId === t.id ? "#F0E8D8" : "#5A5448", fontWeight: typeId === t.id ? "600" : "400" }}>{t.label}</div>
                <div style={{ fontSize: "10px", color: typeId === t.id ? "#8A8070" : "#3A3428", marginTop: "3px" }}>{t.sub}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Step 2: Prompt Tab ── */}
        <section style={{ marginBottom: "26px" }}>
          <Label>02 · 提示词类型</Label>
          <div style={{ display: "flex", gap: "0", border: `1px solid ${border}`, width: "fit-content" }}>
            {[
              { id: "list", label: "提示词 A · 清单生成", sub: "用一次，建立案例索引" },
              { id: "deep", label: "提示词 B · 深度解析", sub: "每案例用一次，生成知识库条目" },
            ].map((tab, i) => (
              <button key={tab.id} onClick={() => setPromptTab(tab.id)} style={{
                background: promptTab === tab.id ? card : panel,
                border: "none",
                borderLeft: i > 0 ? `1px solid ${border}` : "none",
                padding: "11px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.18s",
              }}>
                <div style={{ fontSize: "12px", color: promptTab === tab.id ? c : "#5A5448", fontWeight: "600" }}>{tab.label}</div>
                <div style={{ fontSize: "10px", color: "#4A4438", marginTop: "3px" }}>{tab.sub}</div>
              </button>
            ))}
          </div>

          {/* Flow hint */}
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "10px", color: "#4A4438", background: panel, border: `1px solid ${border}`, padding: "6px 12px" }}>
              ① 用提示词A → 得到案例清单
            </div>
            <div style={{ fontSize: "10px", color: "#3A3428" }}>→</div>
            <div style={{ fontSize: "10px", color: "#4A4438", background: panel, border: `1px solid ${border}`, padding: "6px 12px" }}>
              ② 用提示词B逐案例解析（重复使用）
            </div>
          </div>
        </section>

        {/* ── Step 3: Dimensions + Precision (deep only) ── */}
        {promptTab === "deep" && (
          <>
            <section style={{ marginBottom: "24px" }}>
              <Label>03 · 解析维度</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {currentType.dimensions.map(dim => {
                  const active = selections.includes(dim.id);
                  return (
                    <button key={dim.id} onClick={() => toggleDim(dim.id)} style={{
                      background: active ? card : panel,
                      border: active ? `1px solid ${c}40` : `1px solid ${border}`,
                      padding: "11px 13px", cursor: "pointer", textAlign: "left", transition: "all 0.18s", position: "relative",
                    }}>
                      {active && <div style={{ position: "absolute", top: "8px", right: "9px", width: "5px", height: "5px", borderRadius: "50%", background: c }} />}
                      <div style={{ fontSize: "12px", color: active ? "#F0E8D8" : "#4A4438", fontWeight: active ? "600" : "400", marginBottom: "3px" }}>{dim.label}</div>
                      <div style={{ fontSize: "10px", color: active ? "#7A7060" : "#3A3028", marginBottom: "5px" }}>{dim.desc}</div>
                      <div style={{ fontSize: "10px", color: active ? c + "99" : "#2A2820", lineHeight: "1.4" }}>{dim.words[precision]}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <Label>04 · 解析精度</Label>
              <div style={{ display: "flex", gap: "8px" }}>
                {PRECISION_OPTIONS.map(p => (
                  <button key={p.id} onClick={() => setPrecision(p.id)} style={{
                    background: precision === p.id ? card : panel,
                    border: precision === p.id ? `1px solid ${c}55` : `1px solid ${border}`,
                    padding: "10px 18px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.18s",
                  }}>
                    <div style={{ fontSize: "12px", color: precision === p.id ? c : "#5A5448", fontWeight: "600" }}>{p.label}</div>
                    <div style={{ fontSize: "10px", color: "#4A4438", marginTop: "3px" }}>{p.sub}</div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── Generate ── */}
        <button onClick={generate} style={{
          background: c, color: "#0F0E0C", border: "none",
          padding: "12px 28px", fontSize: "12px", fontFamily: "Georgia, serif",
          letterSpacing: "0.15em", fontWeight: "600", cursor: "pointer",
          marginBottom: "26px", transition: "opacity 0.2s",
        }}
          onMouseOver={e => e.target.style.opacity = "0.82"}
          onMouseOut={e => e.target.style.opacity = "1"}
        >
          生成提示词
        </button>

        {/* ── Output ── */}
        {(generated || animating) && (
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <Label style={{ margin: 0 }}>{promptTab === "deep" ? "05" : "03"} · 生成结果</Label>
              {generated && (
                <button onClick={copy} style={{
                  background: "transparent", border: `1px solid ${copied ? c : "#353028"}`,
                  color: copied ? c : "#6A6050", padding: "5px 14px", fontSize: "11px",
                  letterSpacing: "0.1em", cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s",
                }}>
                  {copied ? "✓ 已复制" : "复制提示词"}
                </button>
              )}
            </div>
            <div style={{
              background: panel, border: `1px solid ${border}`, borderLeft: `3px solid ${c}`,
              padding: "20px 22px", opacity: animating ? 0.25 : 1, transition: "opacity 0.3s",
            }}>
              {animating
                ? <div style={{ color: "#4A4438", fontSize: "12px" }}>正在生成…</div>
                : <pre style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "11.5px", lineHeight: "1.95", color: "#C0B8A8", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {generated}
                  </pre>
              }
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div style={{ fontSize: "9px", letterSpacing: "0.28em", color: "#5A5448", textTransform: "uppercase", marginBottom: "11px", ...style }}>
      {children}
    </div>
  );
}

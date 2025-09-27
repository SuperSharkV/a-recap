import Link from "next/link";

const features = [
  {
    title: "知识随手记",
    description:
      "以卡片的形式快速收集灵感、重点与公式，分组管理让知识库井井有条。",
    href: "/input",
    cta: "立即录入",
  },
  {
    title: "全局可视化管理",
    description:
      "支持搜索、分组筛选与一键编辑，随时更新知识点内容，保证知识库保持最新状态。",
    href: "/manage",
    cta: "前往管理",
  },
  {
    title: "AI 智能复习",
    description:
      "随机抽取知识点生成题目，输入答案后即可获取 AI 反馈，实现高效的间隔复习。",
    href: "/review",
    cta: "开始复习",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-10 shadow-lg shadow-sky-500/10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
              AI Recap Workspace
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              把知识点交给 AI，专心构建你的长期记忆体系
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              A-Recap 将知识卡片、分组管理与 AI 复习助手融合在一个页面中。只需输入知识点，系统会在复习时智能提问并点评你的回答，让刻意练习变得轻松高效。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/input"
                className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
              >
                立即创建知识卡片
              </Link>
              <Link
                href="/review"
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-sky-400 hover:text-sky-200"
              >
                快速体验复习流程
              </Link>
            </div>
          </div>
          <div className="relative flex-1 rounded-3xl border border-white/5 bg-slate-950/60 p-6">
            <div className="absolute -top-4 right-12 h-28 w-28 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute -bottom-8 left-10 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="relative space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-medium text-sky-200">间隔复习提醒</p>
                <p className="mt-3 text-sm text-slate-200">
                  “牛顿第二定律：物体的加速度与合外力成正比，与质量成反比。”
                </p>
                <p className="mt-4 text-xs text-slate-400">下一次复习：明天 09:30</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-medium text-sky-200">AI 复习助手</p>
                <p className="mt-3 text-sm text-slate-200">
                  “请举例说明牛顿第二定律在日常生活中的应用，并解释你观察到的现象。”
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-medium text-emerald-200">反馈示例</p>
                <p className="mt-3 text-sm text-slate-200">
                  “回答准确描述了力、质量与加速度之间的关系，可补充说明受力变化对结果的影响。”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/40 transition hover:-translate-y-1 hover:border-sky-400/60 hover:shadow-sky-500/20"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              <p className="text-sm leading-6 text-slate-300">{feature.description}</p>
            </div>
            <Link
              href={feature.href}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition group-hover:text-sky-200"
            >
              {feature.cta}
              <span aria-hidden className="text-lg">→</span>
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/60 to-slate-900/30 p-8 shadow-lg shadow-slate-900/40">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">数据安全可靠，学习节奏自由掌控</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• 所有知识点数据集中保存在服务器数据库中，支持备份与多设备访问。</li>
              <li>• 支持自定义分组与搜索过滤，快速定位需要复习的内容。</li>
              <li>• 内置 DeepSeek 模型接入流程，也可替换为自有大模型服务，灵活扩展。</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
            <p className="font-semibold text-sky-200">配置提示</p>
            <p className="mt-3">
              如需接入在线大模型，请在 <code className="rounded bg-slate-800 px-1 py-0.5">.env.local</code>{" "}
              中配置 <code className="rounded bg-slate-800 px-1 py-0.5">DEEPSEEK_API_KEY</code>{" "}
              （可选 <code className="rounded bg-slate-800 px-1 py-0.5">DEEPSEEK_MODEL</code>）。系统会自动调用 DeepSeek 聊天接口；若未配置，将使用本地提示词作为兜底策略。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

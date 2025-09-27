"use client";

import { FormEvent, useMemo, useState } from "react";
import { KnowledgeItem, useKnowledge } from "@/components/knowledge-provider";

interface AttemptRecord {
  question: string;
  answer: string;
  feedback: string;
  createdAt: string;
}

const buildFallbackQuestion = (item: KnowledgeItem) => {
  const title = item.title ? `「${item.title}」` : `「${item.groupName}」中的知识`;
  return `请根据${title}的内容，设计一个开放性问题，要求回答者能够阐述核心概念并结合实例。已知知识点：${item.content}`;
};

const buildFallbackFeedback = (item: KnowledgeItem, answer: string) => {
  return `你的回答：${answer || "（未填写）"}。

知识点参考：${item.content}。

请对比参考内容，补充遗漏的关键概念或例子，以加深记忆。`;
};

async function callAiService(body: Record<string, unknown>) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("AI 服务调用失败");
  }

  const data = (await response.json()) as { output?: string };
  return data.output;
}

export default function ReviewPage() {
  const { items, loading } = useKnowledge();
  const [currentItem, setCurrentItem] = useState<KnowledgeItem | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AttemptRecord[]>([]);

  const stats = useMemo(() => {
    const total = items.length;
    const groups = new Set(items.map((item) => item.groupId));
    return {
      total,
      groups: groups.size,
    };
  }, [items]);

  const pickRandomItem = () => {
    if (!items.length) return null;
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  };

  const handleGenerateQuestion = async () => {
    if (loading) {
      setError("知识库正在加载，请稍候再试");
      return;
    }
    if (!items.length) {
      setError("知识库为空，请先录入知识点");
      return;
    }
    setError(null);
    setFeedback("");
    setAnswer("");
    setLoadingQuestion(true);

    const item = pickRandomItem();
    if (!item) {
      setLoadingQuestion(false);
      return;
    }

    setCurrentItem(item);

    try {
      const output = await callAiService({ mode: "question", item });
      setQuestion(output ?? buildFallbackQuestion(item));
    } catch (error) {
      console.error(error);
      setQuestion(buildFallbackQuestion(item));
      setError("AI 服务暂不可用，已使用本地提示词生成题目。");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentItem) {
      setError("请先点击“出题”获取题目");
      return;
    }
    if (!answer.trim()) {
      setError("请先填写你的答案");
      return;
    }

    setError(null);
    setLoadingFeedback(true);

    try {
      const output = await callAiService({
        mode: "feedback",
        item: currentItem,
        question,
        answer,
      });
      const resolvedFeedback = output ?? buildFallbackFeedback(currentItem, answer);
      setFeedback(resolvedFeedback);
      setHistory((prev) => [
        {
          question,
          answer,
          feedback: resolvedFeedback,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error(error);
      const fallback = buildFallbackFeedback(currentItem, answer);
      setFeedback(fallback);
      setHistory((prev) => [
        {
          question,
          answer,
          feedback: fallback,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setError("AI 服务暂不可用，已生成离线反馈。");
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 shadow-lg shadow-slate-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">智能复习</h1>
            <p className="mt-2 text-sm text-slate-300">
              系统会随机抽取知识点生成题目，输入答案后即可获得 AI 反馈，帮助你进行深度复习。
            </p>
          </div>
          <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-200">
            <span>
              知识总数：
              <strong className="text-sky-300">{loading ? "--" : stats.total}</strong>
            </span>
            <span>
              分组数：
              <strong className="text-sky-300">{loading ? "--" : stats.groups}</strong>
            </span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleGenerateQuestion}
            className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loadingQuestion || loading || !items.length}
          >
            {loadingQuestion ? "生成中..." : "出题"}
          </button>
          {currentItem && (
            <span className="rounded-full border border-white/10 px-4 py-1 text-xs text-slate-300">
              当前复习：{currentItem.title || currentItem.groupName}
            </span>
          )}
          {error && (
            <span className="rounded-full border border-rose-400/50 bg-rose-400/15 px-4 py-1 text-xs text-rose-100">
              {error}
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/40">
          <h2 className="text-sm font-semibold text-slate-200">复习区</h2>
          {question ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">AI 出题</p>
                <p className="mt-2 text-sm leading-7 text-slate-200 whitespace-pre-line">{question}</p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmitAnswer}>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    我的答案
                  </label>
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    rows={6}
                    placeholder="请尝试完整作答，描述思路、步骤或示例..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer("");
                      setFeedback("");
                    }}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/60 hover:text-rose-200"
                  >
                    清空
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-400 px-6 py-2 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loadingFeedback}
                  >
                    {loadingFeedback ? "评估中..." : "提交答案"}
                  </button>
                </div>
              </form>
              {feedback && (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-sm text-emerald-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">AI 反馈</p>
                  <p className="mt-2 whitespace-pre-line leading-7">{feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-slate-950/30 p-8 text-center text-sm text-slate-300">
              点击“出题”按钮开始复习，系统将从知识库中随机抽取内容。
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-white/10 bg-slate-900/30 p-6 shadow-lg shadow-slate-950/30">
          <h2 className="text-sm font-semibold text-slate-200">复习历史</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-xs text-slate-400">
              暂无复习记录，完成一次答题后将自动保存最近的反馈。
            </p>
          ) : (
            <ul className="mt-4 space-y-4 text-xs text-slate-300">
              {history.map((record) => (
                <li key={record.createdAt} className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>{new Date(record.createdAt).toLocaleTimeString()}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-sky-200">
                      复习完成
                    </span>
                  </div>
                  <p className="font-semibold text-sky-200">问题</p>
                  <p className="whitespace-pre-line text-slate-200">{record.question}</p>
                  <p className="font-semibold text-emerald-200">我的答案</p>
                  <p className="whitespace-pre-line text-slate-200">{record.answer}</p>
                  <p className="font-semibold text-amber-200">AI 反馈</p>
                  <p className="whitespace-pre-line text-slate-200">{record.feedback}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}

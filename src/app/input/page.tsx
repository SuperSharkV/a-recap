"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useKnowledge } from "@/components/knowledge-provider";

export default function InputPage() {
  const { groups, addGroup, addItem, loading } = useKnowledge();
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!loading && !selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups, loading, selectedGroup]);

  const contentLength = useMemo(() => content.trim().length, [content]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setNewGroupName("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    let groupToUse = selectedGroup;
    const trimmedNewGroup = newGroupName.trim();

    if (!groupToUse && !trimmedNewGroup) {
      setStatus({ type: "error", text: "请选择或创建一个分组" });
      return;
    }

    if (trimmedNewGroup) {
      const result = await addGroup(trimmedNewGroup);
      if (!result.success || !result.group) {
        setStatus({
          type: "error",
          text: result.reason ?? "分组创建失败，请重试",
        });
        return;
      }
      groupToUse = result.group.id;
      setSelectedGroup(result.group.id);
    }

    if (!groupToUse) {
      setStatus({ type: "error", text: "请选择有效的分组" });
      return;
    }

    const result = await addItem({
      content,
      title,
      groupId: groupToUse,
    });

    if (!result.success) {
      setStatus({
        type: "error",
        text: result.reason ?? "保存失败，请重试",
      });
      return;
    }

    setStatus({ type: "success", text: "知识点已保存到知识库！" });
    resetForm();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-10 rounded-3xl border border-white/10 bg-slate-900/40 p-8 shadow-lg shadow-slate-900/40">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold text-white">知识录入</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            输入你想要记忆的知识点，可以为其设置标题与分组，方便在知识库中快速检索。所有内容会同步保存到服务器侧的知识库，以便在不同设备中保持一致。
          </p>
        </header>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="title">
              标题（可选）
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例如：牛顿第二定律"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/50 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="content">
              知识内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="请输入知识点的详细描述、公式或关键记忆要点..."
              rows={8}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white shadow-inner shadow-slate-950/50 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            <p className="text-right text-xs text-slate-400">字数：{contentLength}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <span className="text-sm font-medium text-slate-200">选择分组</span>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedGroup}
                onChange={(event) => setSelectedGroup(event.target.value)}
                className="min-w-[180px] rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                disabled={loading && !groups.length}
              >
                {!groups.length && (
                  <option value="">
                    {loading ? "正在加载分组..." : "暂无分组"}
                  </option>
                )}
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400">或创建新分组</span>
              <input
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="新分组名称"
                className="flex-1 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>
          </div>

          {status && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-400/40 bg-rose-400/10 text-rose-200"
              }`}
            >
              {status.text}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              小提示：可以将长篇内容拆分成多个卡片，便于 AI 在复习时生成更精准的问题。
            </p>
            <button
              type="submit"
              className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
            >
              保存到知识库
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

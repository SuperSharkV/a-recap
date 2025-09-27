"use client";

import { useMemo, useState } from "react";
import { KnowledgeItem, useKnowledge } from "@/components/knowledge-provider";

interface ToastState {
  type: "success" | "error";
  text: string;
}

const ALL_GROUPS = "ALL";

export default function ManagePage() {
  const {
    items,
    groups,
    addGroup,
    renameGroup,
    deleteGroup,
    updateItem,
    deleteItem,
    loading,
  } = useKnowledge();

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>(ALL_GROUPS);
  const [newGroup, setNewGroup] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    content: string;
    groupId: string;
  } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items
      .filter((item) => (groupFilter === ALL_GROUPS ? true : item.groupId === groupFilter))
      .filter((item) => {
        if (!keyword) return true;
        return (
          item.title?.toLowerCase().includes(keyword) ||
          item.content.toLowerCase().includes(keyword) ||
          item.groupName.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [groupFilter, items, search]);

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
    setTimeout(() => setToast(null), 3200);
  };

  const handleCreateGroup = async () => {
    const trimmed = newGroup.trim();
    if (!trimmed) {
      showToast({ type: "error", text: "请输入分组名称" });
      return;
    }
    const result = await addGroup(trimmed);
    if (result.success && result.group) {
      showToast({ type: "success", text: `已创建分组「${result.group.name}」` });
      setNewGroup("");
    } else {
      showToast({ type: "error", text: result.reason ?? "创建失败" });
    }
  };

  const startRename = (groupId: string, currentName: string) => {
    setEditingGroupId(groupId);
    setEditingGroupName(currentName);
  };

  const cancelRename = () => {
    setEditingGroupId(null);
    setEditingGroupName("");
  };

  const saveRename = async () => {
    if (!editingGroupId) return;
    const result = await renameGroup(editingGroupId, editingGroupName);
    if (result.success && result.group) {
      showToast({ type: "success", text: `分组已重命名为「${result.group.name}」` });
      cancelRename();
    } else {
      showToast({ type: "error", text: result.reason ?? "重命名失败" });
    }
  };

  const handleDeleteGroup = async (groupId: string, name: string) => {
    const confirmed = window.confirm(`确认删除分组「${name}」吗？`);
    if (!confirmed) return;
    const result = await deleteGroup(groupId);
    if (result.success) {
      showToast({ type: "success", text: `已删除分组「${name}」` });
      if (groupFilter === groupId) {
        setGroupFilter(ALL_GROUPS);
      }
      if (editingGroupId === groupId) {
        cancelRename();
      }
    } else {
      showToast({ type: "error", text: result.reason ?? "删除失败" });
    }
  };

  const startEditItem = (item: KnowledgeItem) => {
    setEditingItemId(item.id);
    setEditForm({
      title: item.title ?? "",
      content: item.content,
      groupId: item.groupId,
    });
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setEditForm(null);
  };

  const saveItem = async () => {
    if (!editingItemId || !editForm) return;
    if (!editForm.content.trim()) {
      showToast({ type: "error", text: "知识内容不能为空" });
      return;
    }
    const result = await updateItem(editingItemId, {
      title: editForm.title,
      content: editForm.content,
      groupId: editForm.groupId,
    });
    if (result.success) {
      showToast({ type: "success", text: "知识点已更新" });
      cancelEditItem();
    } else {
      showToast({ type: "error", text: result.reason ?? "更新失败，请重试" });
    }
  };

  const removeItem = async (id: string) => {
    const confirmed = window.confirm("确认删除该知识点吗？删除后无法恢复。");
    if (!confirmed) return;
    const result = await deleteItem(id);
    if (result.success) {
      showToast({ type: "success", text: "知识点已删除" });
      if (editingItemId === id) {
        cancelEditItem();
      }
    } else {
      showToast({ type: "error", text: result.reason ?? "删除失败，请重试" });
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 shadow-lg shadow-slate-900/40">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-white">知识管理</h1>
          <p className="text-sm text-slate-300">
            对已有知识点进行搜索、筛选、编辑或删除。你也可以创建或重命名分组，保持知识库的结构清晰。
          </p>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-sm font-semibold text-slate-200">快速筛选</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  关键字
                </label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索标题、内容或分组"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  分组
                </label>
                <select
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value={ALL_GROUPS}>全部</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              {loading ? "正在加载知识库..." : (
                <>
                  共找到 <span className="text-sky-300">{filteredItems.length}</span> 条记录。
                </>
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-sm font-semibold text-slate-200">分组管理</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                value={newGroup}
                onChange={(event) => setNewGroup(event.target.value)}
                placeholder="新的分组名称"
                className="flex-1 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
              <button
                type="button"
                onClick={handleCreateGroup}
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
              >
                新建分组
              </button>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3"
                >
                  {editingGroupId === group.id ? (
                    <div className="flex flex-1 items-center gap-3">
                      <input
                        value={editingGroupName}
                        onChange={(event) => setEditingGroupName(event.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                      <button
                        type="button"
                        onClick={saveRename}
                        className="rounded-full bg-emerald-400 px-4 py-1 text-xs font-semibold text-emerald-900 shadow-sm shadow-emerald-500/40 hover:bg-emerald-300"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        className="rounded-full border border-white/10 px-4 py-1 text-xs text-slate-200 hover:border-white/20"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-100">{group.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => startRename(group.id, group.name)}
                          className="rounded-full border border-white/10 px-3 py-1 text-slate-200 transition hover:border-white/20"
                        >
                          重命名
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="rounded-full border border-rose-400/50 bg-rose-400/10 px-3 py-1 text-rose-200 transition hover:border-rose-300"
                        >
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">知识卡片</h2>
        {toast && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              toast.type === "success"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/40 bg-rose-400/10 text-rose-200"
            }`}
          >
            {toast.text}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/30"
            >
              {editingItemId === item.id && editForm ? (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      标题（可选）
                    </label>
                    <input
                      value={editForm.title}
                      onChange={(event) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, title: event.target.value } : prev
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      内容
                    </label>
                    <textarea
                      value={editForm.content}
                      onChange={(event) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, content: event.target.value } : prev
                        )
                      }
                      rows={6}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm leading-6 text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      分组
                    </label>
                    <select
                      value={editForm.groupId}
                      onChange={(event) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, groupId: event.target.value } : prev
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    >
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={saveItem}
                      className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
                    >
                      保存修改
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditItem}
                      className="rounded-full border border-white/10 px-5 py-2 text-sm text-slate-200 transition hover:border-white/20"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {item.title || "未命名知识点"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        分组：<span className="text-sky-300">{item.groupName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => startEditItem(item)}
                        className="rounded-full border border-white/10 px-3 py-1 text-slate-200 transition hover:border-white/20"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-full border border-rose-400/60 bg-rose-400/10 px-3 py-1 text-rose-200 transition hover:border-rose-300"
                      >
                        删除
                      </button>
                    </div>
                  </header>
                  <p className="text-sm leading-6 text-slate-200 whitespace-pre-line">{item.content}</p>
                  <footer className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>创建：{new Date(item.createdAt).toLocaleString()}</span>
                    <span>更新：{new Date(item.updatedAt).toLocaleString()}</span>
                  </footer>
                </div>
              )}
            </article>
          ))}
          {!filteredItems.length && (
            <div className="rounded-3xl border border-dashed border-white/20 bg-slate-900/30 p-8 text-center text-sm text-slate-300">
              {loading ? "正在加载知识卡片..." : "暂无符合筛选条件的知识点"}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

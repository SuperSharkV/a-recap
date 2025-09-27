"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface GroupItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string | null;
  content: string;
  groupId: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeState {
  groups: GroupItem[];
  items: KnowledgeItem[];
}

export interface GroupResult {
  success: boolean;
  reason?: string;
  group?: GroupItem;
}

export interface ItemResult {
  success: boolean;
  reason?: string;
  item?: KnowledgeItem;
}

interface KnowledgeContextValue extends KnowledgeState {
  loading: boolean;
  refresh: () => Promise<void>;
  addGroup: (name: string) => Promise<GroupResult>;
  renameGroup: (groupId: string, name: string) => Promise<GroupResult>;
  deleteGroup: (groupId: string) => Promise<GroupResult>;
  addItem: (payload: {
    title?: string;
    content: string;
    groupId: string;
  }) => Promise<ItemResult>;
  updateItem: (
    id: string,
    updates: Partial<{
      title: string | null;
      content: string;
      groupId: string;
    }>
  ) => Promise<ItemResult>;
  deleteItem: (id: string) => Promise<GroupResult>;
}

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? "请求失败");
  }
  return data;
}

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<KnowledgeState>({ groups: [], items: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestJson<{ groups: GroupItem[]; items: KnowledgeItem[] }>(
        "/api/knowledge"
      );
      setState({ groups: data.groups, items: data.items });
    } catch (error) {
      console.error("Failed to load knowledge base", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addGroup = useCallback(async (name: string): Promise<GroupResult> => {
    try {
      const data = await requestJson<{ group: GroupItem }>("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setState((prev) => ({
        ...prev,
        groups: [...prev.groups, data.group].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt)
        ),
      }));
      return { success: true, group: data.group };
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建分组失败";
      return { success: false, reason: message };
    }
  }, []);

  const renameGroup = useCallback(
    async (groupId: string, name: string): Promise<GroupResult> => {
      try {
        const data = await requestJson<{ group: GroupItem }>(`/api/groups/${groupId}`, {
          method: "PATCH",
          body: JSON.stringify({ name }),
        });
        setState((prev) => ({
          ...prev,
          groups: prev.groups.map((group) =>
            group.id === groupId ? data.group : group
          ),
          items: prev.items.map((item) =>
            item.groupId === groupId
              ? { ...item, groupName: data.group.name }
              : item
          ),
        }));
        return { success: true, group: data.group };
      } catch (error) {
        const message = error instanceof Error ? error.message : "重命名失败";
        return { success: false, reason: message };
      }
    },
    []
  );

  const deleteGroup = useCallback(
    async (groupId: string): Promise<GroupResult> => {
      try {
        await requestJson(`/api/groups/${groupId}`, { method: "DELETE" });
        setState((prev) => ({
          ...prev,
          groups: prev.groups.filter((group) => group.id !== groupId),
        }));
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "删除失败";
        return { success: false, reason: message };
      }
    },
    []
  );

  const addItem = useCallback(
    async (payload: { title?: string; content: string; groupId: string }): Promise<ItemResult> => {
      try {
        const data = await requestJson<{ item: KnowledgeItem }>("/api/knowledge", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setState((prev) => ({
          ...prev,
          items: [data.item, ...prev.items].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
        }));
        return { success: true, item: data.item };
      } catch (error) {
        const message = error instanceof Error ? error.message : "保存失败";
        return { success: false, reason: message };
      }
    },
    []
  );

  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<{ title: string | null; content: string; groupId: string }>
    ): Promise<ItemResult> => {
      try {
        const data = await requestJson<{ item: KnowledgeItem }>(`/api/knowledge/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
        });
        setState((prev) => ({
          ...prev,
          items: prev.items
            .map((item) => (item.id === id ? data.item : item))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        }));
        return { success: true, item: data.item };
      } catch (error) {
        const message = error instanceof Error ? error.message : "更新失败";
        return { success: false, reason: message };
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string): Promise<GroupResult> => {
    try {
      await requestJson(`/api/knowledge/${id}`, { method: "DELETE" });
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除失败";
      return { success: false, reason: message };
    }
  }, []);

  const value = useMemo<KnowledgeContextValue>(
    () => ({
      ...state,
      loading,
      refresh,
      addGroup,
      renameGroup,
      deleteGroup,
      addItem,
      updateItem,
      deleteItem,
    }),
    [state, loading, refresh, addGroup, renameGroup, deleteGroup, addItem, updateItem, deleteItem]
  );

  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>;
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error("useKnowledge must be used within KnowledgeProvider");
  }
  return context;
}

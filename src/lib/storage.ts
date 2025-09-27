import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface GroupRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRecord {
  id: string;
  title?: string | null;
  content: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeStore {
  groups: GroupRecord[];
  items: KnowledgeRecord[];
}

export const DEFAULT_GROUP_NAME = "默认分组";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "knowledge-store.json");

function ensureStore(): KnowledgeStore {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!existsSync(STORE_PATH)) {
    const now = new Date().toISOString();
    const defaultGroup: GroupRecord = {
      id: randomUUID(),
      name: DEFAULT_GROUP_NAME,
      createdAt: now,
      updatedAt: now,
    };
    const initial: KnowledgeStore = {
      groups: [defaultGroup],
      items: [],
    };
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  try {
    const buffer = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(buffer) as KnowledgeStore;
    if (!Array.isArray(parsed.groups) || parsed.groups.length === 0) {
      const now = new Date().toISOString();
      const defaultGroup: GroupRecord = {
        id: randomUUID(),
        name: DEFAULT_GROUP_NAME,
        createdAt: now,
        updatedAt: now,
      };
      parsed.groups = [defaultGroup];
    }
    if (!Array.isArray(parsed.items)) {
      parsed.items = [];
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read knowledge store, recreating", error);
    const now = new Date().toISOString();
    const defaultGroup: GroupRecord = {
      id: randomUUID(),
      name: DEFAULT_GROUP_NAME,
      createdAt: now,
      updatedAt: now,
    };
    const fallback: KnowledgeStore = {
      groups: [defaultGroup],
      items: [],
    };
    writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

function persist(store: KnowledgeStore) {
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function getStoreSnapshot(): KnowledgeStore {
  return ensureStore();
}

export function listGroups(): GroupRecord[] {
  const store = ensureStore();
  return store.groups.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function createGroup(name: string): GroupRecord {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("请输入有效的分组名称");
  }
  const store = ensureStore();
  if (store.groups.some((group) => group.name === trimmed)) {
    throw new Error("该分组已存在");
  }
  const now = new Date().toISOString();
  const group: GroupRecord = {
    id: randomUUID(),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
  };
  store.groups.push(group);
  persist(store);
  return group;
}

export function renameGroup(groupId: string, newName: string): GroupRecord {
  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error("请输入有效的分组名称");
  }
  const store = ensureStore();
  const target = store.groups.find((group) => group.id === groupId);
  if (!target) {
    throw new Error("未找到需要重命名的分组");
  }
  if (target.name === DEFAULT_GROUP_NAME) {
    throw new Error("默认分组无法重命名");
  }
  if (store.groups.some((group) => group.name === trimmed)) {
    throw new Error("新的分组名称已存在");
  }
  target.name = trimmed;
  target.updatedAt = new Date().toISOString();
  persist(store);
  return target;
}

export function deleteGroup(groupId: string): void {
  const store = ensureStore();
  const target = store.groups.find((group) => group.id === groupId);
  if (!target) {
    throw new Error("未找到需要删除的分组");
  }
  if (target.name === DEFAULT_GROUP_NAME) {
    throw new Error("默认分组无法删除");
  }
  if (store.items.some((item) => item.groupId === groupId)) {
    throw new Error("请先移动或删除该分组下的知识点");
  }
  store.groups = store.groups.filter((group) => group.id !== groupId);
  persist(store);
}

export function listKnowledge(): KnowledgeRecord[] {
  const store = ensureStore();
  return store.items
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createKnowledge(
  payload: Pick<KnowledgeRecord, "content" | "title" | "groupId">
): KnowledgeRecord {
  const trimmedContent = payload.content.trim();
  if (!trimmedContent) {
    throw new Error("知识内容不能为空");
  }
  const store = ensureStore();
  const groupExists = store.groups.some((group) => group.id === payload.groupId);
  if (!groupExists) {
    throw new Error("请选择有效的分组");
  }
  const now = new Date().toISOString();
  const record: KnowledgeRecord = {
    id: randomUUID(),
    title: payload.title?.trim() || null,
    content: trimmedContent,
    groupId: payload.groupId,
    createdAt: now,
    updatedAt: now,
  };
  store.items.push(record);
  persist(store);
  return record;
}

export function updateKnowledge(
  id: string,
  updates: Partial<Pick<KnowledgeRecord, "title" | "content" | "groupId">>
): KnowledgeRecord {
  const store = ensureStore();
  const target = store.items.find((item) => item.id === id);
  if (!target) {
    throw new Error("未找到需要更新的知识点");
  }
  if (updates.groupId) {
    const groupExists = store.groups.some((group) => group.id === updates.groupId);
    if (!groupExists) {
      throw new Error("请选择有效的分组");
    }
    target.groupId = updates.groupId;
  }
  if (typeof updates.title !== "undefined") {
    target.title = updates.title?.trim() || null;
  }
  if (typeof updates.content !== "undefined") {
    const trimmed = updates.content.trim();
    if (!trimmed) {
      throw new Error("知识内容不能为空");
    }
    target.content = trimmed;
  }
  target.updatedAt = new Date().toISOString();
  persist(store);
  return target;
}

export function deleteKnowledge(id: string): void {
  const store = ensureStore();
  const exists = store.items.some((item) => item.id === id);
  if (!exists) {
    throw new Error("未找到需要删除的知识点");
  }
  store.items = store.items.filter((item) => item.id !== id);
  persist(store);
}

export function getRandomKnowledge(): KnowledgeRecord | null {
  const store = ensureStore();
  if (!store.items.length) {
    return null;
  }
  const index = Math.floor(Math.random() * store.items.length);
  return store.items[index];
}

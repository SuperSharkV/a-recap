import { NextResponse } from "next/server";
import { createKnowledge, listGroups, listKnowledge } from "@/lib/storage";

export async function GET() {
  const items = listKnowledge();
  const groups = listGroups();
  const groupMap = new Map(groups.map((group) => [group.id, group.name]));
  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      groupName: groupMap.get(item.groupId) ?? "",
    })),
    groups,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string | null;
      content?: string;
      groupId?: string;
    };
    if (!body || !body.groupId) {
      return NextResponse.json({ error: "请选择分组" }, { status: 400 });
    }
    const record = createKnowledge({
      title: body.title ?? null,
      content: body.content ?? "",
      groupId: body.groupId,
    });
    const groups = listGroups();
    const group = groups.find((group) => group.id === record.groupId);
    return NextResponse.json({
      item: {
        ...record,
        groupName: group?.name ?? "",
      },
    });
  } catch (error) {
    console.error("Failed to create knowledge", error);
    const message = error instanceof Error ? error.message : "服务器异常";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

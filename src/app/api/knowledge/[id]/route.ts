import { NextResponse } from "next/server";
import { deleteKnowledge, listGroups, updateKnowledge } from "@/lib/storage";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const body = (await request.json()) as {
      title?: string | null;
      content?: string;
      groupId?: string;
    };
    const record = updateKnowledge(id, {
      title: body.title,
      content: body.content,
      groupId: body.groupId,
    });
    const groups = listGroups();
    const group = groups.find((groupItem) => groupItem.id === record.groupId);
    return NextResponse.json({
      item: {
        ...record,
        groupName: group?.name ?? "",
      },
    });
  } catch (error) {
    console.error("Failed to update knowledge", error);
    const message = error instanceof Error ? error.message : "服务器异常";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = params;
  try {
    deleteKnowledge(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete knowledge", error);
    const message = error instanceof Error ? error.message : "服务器异常";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

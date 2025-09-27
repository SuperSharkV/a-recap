import { NextResponse } from "next/server";
import { deleteGroup, renameGroup } from "@/lib/storage";

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const { name } = (await request.json()) as { name?: string };
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "请输入有效的分组名称" }, { status: 400 });
    }
    const group = renameGroup(id, name);
    return NextResponse.json({ group });
  } catch (error) {
    console.error("Failed to rename group", error);
    const message = error instanceof Error ? error.message : "服务器异常";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = params;
  try {
    deleteGroup(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete group", error);
    const message = error instanceof Error ? error.message : "服务器异常";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

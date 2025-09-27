import { NextResponse } from "next/server";
import { createGroup, listGroups } from "@/lib/storage";

export async function GET() {
  const groups = listGroups();
  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  try {
    const { name } = (await request.json()) as { name?: string };
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "请输入有效的分组名称" }, { status: 400 });
    }
    const group = createGroup(name);
    return NextResponse.json({ group });
  } catch (error) {
    console.error("Failed to create group", error);
    const message = error instanceof Error ? error.message : "服务器异常";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

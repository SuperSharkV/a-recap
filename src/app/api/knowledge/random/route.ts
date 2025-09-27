import { NextResponse } from "next/server";
import { getRandomKnowledge, listGroups } from "@/lib/storage";

export async function GET() {
  const item = getRandomKnowledge();
  if (!item) {
    return NextResponse.json({ item: null });
  }
  const groups = listGroups();
  const group = groups.find((group) => group.id === item.groupId);
  return NextResponse.json({
    item: {
      ...item,
      groupName: group?.name ?? "",
    },
  });
}

import { NextResponse } from "next/server";
import type { KnowledgeItem } from "@/components/knowledge-provider";

interface AiRequestBody {
  mode: "question" | "feedback";
  item: KnowledgeItem;
  question?: string;
  answer?: string;
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

const fallbackQuestion = (item: KnowledgeItem) => {
  const title = item.title ? `「${item.title}」` : `「${item.groupName || "该分组"}」中的知识`;
  return `请结合${title}，设计一道可以验证理解程度的开放题。请强调关键概念并要求举例说明。参考知识：${item.content}`;
};

const fallbackFeedback = (item: KnowledgeItem, answer: string) => {
  const sanitizedAnswer = answer?.trim() || "（未填写）";
  return `你的回答：${sanitizedAnswer}。

参考知识：${item.content}。

请核对答案中的概念是否完整，尝试补充遗漏或纠正可能的误区。`;
};

const buildQuestionPrompt = (item: KnowledgeItem) => `你是一名学习教练，请基于以下知识点设计一道高质量的复习问题。
- 题目类型：开放式问答或情境应用题
- 目标：帮助学习者复述或迁移运用该知识
- 输出要求：只返回题目内容，采用简洁的中文描述

知识点：${item.content}${item.title ? `\n标题：${item.title}` : ""}${
  item.groupName ? `\n分组：${item.groupName}` : ""
}`;

const buildFeedbackPrompt = (
  item: KnowledgeItem,
  question: string,
  answer: string
) => `你是一名智能教练，请根据知识点、题目以及学习者的回答给出专业反馈。
- 先肯定亮点，再指出待改进部分
- 如有错误或遗漏，请给出正确思路或关键要点
- 用中文回答，语言友好且具体

知识点：${item.content}${item.title ? `\n标题：${item.title}` : ""}${
  item.groupName ? `\n分组：${item.groupName}` : ""
}
题目：${question}
学习者的回答：${answer}`;

async function requestDeepseek(messages: { role: "system" | "user"; content: string }[]) {
  if (!DEEPSEEK_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error", errorText);
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const output = data.choices?.[0]?.message?.content?.trim();
    return output ?? null;
  } catch (error) {
    console.error("DeepSeek request failed", error);
    return null;
  }
}

export async function POST(request: Request) {
  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch (error) {
    console.error("Failed to parse AI request body", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || !body.mode || !body.item) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { mode, item, question = "", answer = "" } = body;

  if (mode === "question") {
    const prompt = buildQuestionPrompt(item);
    const result = await requestDeepseek([
      {
        role: "system",
        content: "你是善于启发式教学的学习教练。",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);
    return NextResponse.json({
      output: result ?? fallbackQuestion(item),
    });
  }

  if (mode === "feedback") {
    const prompt = buildFeedbackPrompt(item, question, answer);
    const result = await requestDeepseek([
      {
        role: "system",
        content: "你是一名鼓励式的学习教练，擅长给出结构化反馈。",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);
    return NextResponse.json({
      output: result ?? fallbackFeedback(item, answer),
    });
  }

  return NextResponse.json({ error: "Unsupported mode" }, { status: 400 });
}

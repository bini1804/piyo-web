import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chat_log_id, feedback, reason_code, reason_text } = body;

    if (!chat_log_id || feedback === undefined) {
      return NextResponse.json(
        { error: "chat_log_id and feedback are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/feedback/${chat_log_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, reason_code, reason_text }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[api/feedback]", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

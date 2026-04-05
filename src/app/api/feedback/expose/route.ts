import { NextRequest, NextResponse } from "next/server";
const BACKEND = process.env.PIYO_API_URL ?? "";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chat_log_id } = body;
    if (!chat_log_id) {
      return NextResponse.json({ error: "missing chat_log_id" }, { status: 400 });
    }
    const res = await fetch(`${BACKEND}/feedback/${chat_log_id}/expose`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[/api/feedback/expose] error:", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

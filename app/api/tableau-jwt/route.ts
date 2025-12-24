import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TABLEAU_CLIENT_ID = process.env.TABLEAU_CLIENT_ID;
const TABLEAU_SECRET = process.env.TABLEAU_SECRET;
const TABLEAU_KID = process.env.TABLEAU_KID;
const TABLEAU_USER = process.env.TABLEAU_USER;

function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function GET() {
  try {
    // 개발 환경에서 환경변수 로드 상태 확인
    if (process.env.NODE_ENV === "development") {
      console.log("[Tableau JWT] 환경변수 로드 상태:", {
        TABLEAU_CLIENT_ID: TABLEAU_CLIENT_ID ? "✓" : "✗",
        TABLEAU_SECRET: TABLEAU_SECRET ? "✓" : "✗",
        TABLEAU_KID: TABLEAU_KID ? "✓" : "✗",
        TABLEAU_USER: TABLEAU_USER ? "✓" : "✗",
      });
    }

    if (!TABLEAU_CLIENT_ID || !TABLEAU_SECRET || !TABLEAU_KID || !TABLEAU_USER) {
      const missingVars = [];
      if (!TABLEAU_CLIENT_ID) missingVars.push("TABLEAU_CLIENT_ID");
      if (!TABLEAU_SECRET) missingVars.push("TABLEAU_SECRET");
      if (!TABLEAU_KID) missingVars.push("TABLEAU_KID");
      if (!TABLEAU_USER) missingVars.push("TABLEAU_USER");
      
      // 개발 환경에서만 상세한 로그 출력
      if (process.env.NODE_ENV === "development") {
        console.warn("[Tableau JWT] 환경변수 누락:", {
          missing: missingVars,
          TABLEAU_CLIENT_ID: !!TABLEAU_CLIENT_ID,
          TABLEAU_SECRET: !!TABLEAU_SECRET,
          TABLEAU_KID: !!TABLEAU_KID,
          TABLEAU_USER: !!TABLEAU_USER,
        });
        console.warn("[Tableau JWT] .env.local 파일이 있다면 개발 서버를 재시작해주세요.");
      }
      
      return NextResponse.json(
        { error: "Tableau 환경변수가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    console.log("[v0] JWT 토큰 생성 시작");

    const now = Math.floor(Date.now() / 1000);

    // JWT Header
    const header = {
      alg: "HS256",
      typ: "JWT",
      kid: TABLEAU_KID,
    };

    // JWT Payload
    const payload = {
      iss: TABLEAU_CLIENT_ID,
      sub: TABLEAU_USER,
      aud: "tableau",
      jti: generateUUID(),
      exp: now + 5 * 60, // 5분
      scp: ["tableau:views:embed"],
    };

    console.log("[v0] Payload:", payload);

    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    const message = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(TABLEAU_SECRET);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

    const signatureArray = new Uint8Array(signature);
    const signatureBase64 = Buffer.from(signatureArray)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const token = `${message}.${signatureBase64}`;

    console.log("[v0] JWT 토큰 생성 성공");

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: any) {
    console.error("[v0] JWT 토큰 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "토큰 생성 실패" },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Script from "next/script";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from 'lucide-react';

const windSpeedData = [
  { time: "00:00", forecast: 8, actual: 8.2 },
  { time: "04:00", forecast: 8.5, actual: 8.3 },
  { time: "08:00", forecast: 9.5, actual: 9.8 },
  { time: "12:00", forecast: 12.5, actual: 12.3 },
  { time: "16:00", forecast: 12, actual: 11.8 },
  { time: "20:00", forecast: 10, actual: 10.2 },
];

const powerGenData = [
  { time: "00:00", power: 250 },
  { time: "04:00", power: 220 },
  { time: "08:00", power: 320 },
  { time: "12:00", power: 420 },
  { time: "16:00", power: 380 },
  { time: "20:00", power: 300 },
];

export default function Page() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [jwtToken, setJwtToken] = useState<string>("");
  const [tokenError, setTokenError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const vizRef = useRef<HTMLElement>(null);
  const viewUrl = "https://prod-kr-a.online.tableau.com/t/renewable/views/info/wind_sample";
  
  const [region, setRegion] = useState("제주도");
  const [timeRange, setTimeRange] = useState("24시간");

  useEffect(() => {
    const checkAuth = () => {
      const sessionId = localStorage.getItem("sessionId");
      const userId = localStorage.getItem("userId");

      if (!sessionId || !userId) {
        router.push("/login?redirect=/visualization");
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isCheckingAuth) return;

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/tableau-jwt");
        
        if (!response.ok) {
          let errorText = "";
          try {
            const errorData = await response.json();
            errorText = errorData.error || "알 수 없는 오류";
          } catch {
            errorText = await response.text();
          }
          
          // 환경변수 미설정 오류인 경우 더 친화적인 메시지 표시
          if (errorText.includes("환경변수가 설정되지 않았습니다")) {
            setTokenError("Tableau 서비스가 현재 사용할 수 없습니다. 관리자에게 문의하세요.");
            // 환경변수 오류는 경고로만 표시 (에러가 아닌 설정 문제)
            console.warn("Tableau 환경변수가 설정되지 않았습니다. 다음 환경변수를 설정해주세요: TABLEAU_CLIENT_ID, TABLEAU_SECRET, TABLEAU_KID, TABLEAU_USER");
            return;
          }
          
          throw new Error(`API 응답 오류: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const cleanToken = String(data.token).trim().replace(/^["']|["']$/g, '');
        setJwtToken(cleanToken);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
        // 환경변수 오류가 아닌 경우에만 콘솔 에러 표시
        if (!errorMessage.includes("환경변수가 설정되지 않았습니다")) {
          console.error("JWT 토큰 가져오기 오류:", errorMessage);
        }
        setTokenError(errorMessage);
      }
    };

    fetchToken();
  }, [isCheckingAuth]);

  useEffect(() => {
    if (scriptLoaded && jwtToken && vizRef.current) {
      // @ts-ignore - tableau-viz는 커스텀 엘리먼트
      vizRef.current.token = jwtToken;
    }
  }, [scriptLoaded, jwtToken]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Script
        type="module"
        src="https://prod-kr-a.online.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setTokenError("Tableau 스크립트를 로드할 수 없습니다")}
      />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          풍력자원 가시화 서비스
        </h1>

        <div className="flex gap-4 mb-6 justify-center">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="제주도">제주도</SelectItem>
              <SelectItem value="강원도">강원도</SelectItem>
              <SelectItem value="전라남도">전라남도</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24시간">24시간</SelectItem>
              <SelectItem value="48시간">48시간</SelectItem>
              <SelectItem value="72시간">72시간</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="distribution" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="distribution">풍력자원 분포</TabsTrigger>
            <TabsTrigger value="analysis">예보 성능 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>풍력자원 분포</CardTitle>
                <CardDescription>지역별 풍력자원 현황</CardDescription>
              </CardHeader>
              <CardContent>
                {tokenError ? (
                  <div className="flex flex-col items-center justify-center h-[600px] text-red-500">
                    <p className="text-lg font-semibold">오류: {tokenError}</p>
                  </div>
                ) : !jwtToken ? (
                  <div className="flex flex-col items-center justify-center h-[600px]">
                    <p className="text-lg">토큰 로딩 중...</p>
                  </div>
                ) : (
                  <div className="w-full" style={{ height: '840px' }}>
                    <tableau-viz
                      ref={vizRef}
                      id="tableauViz"
                      src={viewUrl}
                      width="1400"
                      height="840"
                      hide-tabs
                      toolbar="bottom"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* 풍속 예보 차트 */}
              <Card>
                <CardHeader className="pt-4">
                  <CardTitle className="text-lg">풍속 예보</CardTitle>
                  <CardDescription>최근 24시간 풍속 예측</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={windSpeedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="forecast" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 발전량 예측 차트 */}
              <Card>
                <CardHeader className="pt-4">
                  <CardTitle className="text-lg">발전량 예측</CardTitle>
                  <CardDescription>AI 기반 발전량 예측 결과</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={powerGenData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="power" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 예측 정확도 메트릭 */}
            <Card>
              <CardHeader className="pt-4">
                <CardTitle className="text-lg">예측 정확도</CardTitle>
                <CardDescription>AI 모델의 예측 성능 지표</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-8 py-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">99.5%</div>
                    <div className="text-gray-600">단기 예보 정확도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">97.2%</div>
                    <div className="text-gray-600">중기 예보 정확도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">2.1%</div>
                    <div className="text-gray-600">평균 오차율</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

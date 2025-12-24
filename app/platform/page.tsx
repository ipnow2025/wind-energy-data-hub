import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, CheckCircle, CloudRain } from "lucide-react"

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-balance mb-6 text-primary">풍력자원 데이터 허브</h1>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative bg-sidebar-primary-foreground">
        <img src="/images/offshore-wind-farm-mission.jpg" alt="Offshore Wind Farm" className="w-full h-auto" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl px-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">우리의 미션</h2>
              <p className="text-lg mb-6 text-background">
                한국에너지기술연구원의 축적된 연구 성과와 첨단 기술을 바탕으로, 풍력 에너지의 효율성을 극대화하고
                지속가능한 에너지 생태계 구축에 기여합니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 mt-0.5 flex-shrink-0 text-background" />
                  <div>
                    <h3 className="font-semibold mb-1 text-background">정확한 예측</h3>
                    <p className="text-background">고정밀 풍력자원 모델링</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 mt-0.5 flex-shrink-0 text-background" />
                  <div>
                    <h3 className="font-semibold mb-1 text-background">효율적 관리</h3>
                    <p className="text-background">실시간 모니터링 및 최적화 솔루션</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 mt-0.5 flex-shrink-0 text-background" />
                  <div>
                    <h3 className="font-semibold mb-1 text-background">지속가능성</h3>
                    <p className="text-background">친환경 에너지 생태계 구축</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">핵심 서비스</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              풍력 에너지 산업을 위한 종합 데이터 서비스
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CloudRain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>풍력자원 예측</CardTitle>
                <CardDescription>고해상도 풍력자원 예측 서비스  </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>발전량 예측 가이던스 </CardTitle>
                <CardDescription>고객 맞춤형 풍력발전량 예측 서비스    </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>분석 서비스</CardTitle>
                <CardDescription>경제성 및 입지 분석 서비스</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>협업 플랫폼</CardTitle>
                <CardDescription>협력기관과의 효율적인 협업 지원</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

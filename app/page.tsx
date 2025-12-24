import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, CloudRain, TrendingUp, Users } from "lucide-react"
import { HeroVideo } from "@/components/hero-video"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-black aspect-video">
            {/* Background Video */}
            <HeroVideo />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="max-w-4xl mx-auto text-center px-4">
                <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight mb-6 text-white drop-shadow-lg">
                  맞춤형 풍력자원 데이터
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">풍력 에너지의 미래를 선도합니다</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              K-Energy를 선도하는 한국에너지기술연구원의 기술과 노하우가 집약된
              <br />
              풍력자원 데이터 서비스를 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CloudRain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>풍력자원 예측</CardTitle>
                <CardDescription>고해상도 풍력자원 예측 서비스</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>발전량 예측 가이던스 </CardTitle>
                <CardDescription>고객 맞춤형 풍력발전량 예측 서비스   </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>분석 서비스</CardTitle>
                <CardDescription>경제성 및 입지 분석 서비스</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
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

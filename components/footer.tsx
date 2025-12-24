import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-primary py-8 px-4 text-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 로고와 내용을 가로로 배치 */}
          <div className="flex-1">
            <div className="flex items-start space-x-4">
              {/* 로고 섹션 */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Image
                  src="/images/kier-logo-gray.png"
                  alt="KIER 로고"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                {/* 변경된 플랫폼 이름 */}
                <span className="font-bold text-gray-400">풍력자원데이터허브</span>
              </div>

              {/* 내용 섹션 */}
              <div className="text-xs text-gray-200">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-xs">
                    Copyright © 2025 KOREA INSTITUTE OF ENERGY RESEARCH. All Rights Reserved.
                  </div>
                  <Link
                    href="https://www.kier.re.kr/board?menuId=MENU00557"
                    target="_blank"
                    className="hover:text-white text-xs ml-8"
                  >
                    개인정보처리방침
                  </Link>
                </div>

                <div className="mb-1 text-xs">Address: 대전광역시 유성구 가정로 152</div>

                <div className="text-xs text-gray-300 leading-tight mb-1">
                  본 사이트의 데이터를 이용하여 발생하는 상황에 대하여 법적으로 책임을 지지 않습니다.
                </div>

                <div className="text-xs text-gray-300 leading-tight mb-1">
                  본 센터는 국가표준기본법 제 16조, 동법 시행령 제 14조 3항과 참조표준 제정 및 보급에 관한 운영요령 제
                  18조의 규정에 따라 국가참조표준 데이터센터로 지정되었습니다. [지식경제부 고시 제 2010-235호]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

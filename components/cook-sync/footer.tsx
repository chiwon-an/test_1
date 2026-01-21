import Link from "next/link"
import { ChefHat } from "lucide-react"

const menuItems = [
  {
    title: "서비스",
    links: [
      { text: "레시피 검색", url: "/" },
      { text: "AI 추천", url: "/" },
      { text: "쿠킹 모드", url: "/" },
    ],
  },
  {
    title: "카테고리",
    links: [
      { text: "한식", url: "/" },
      { text: "양식", url: "/" },
      { text: "일식", url: "/" },
      { text: "중식", url: "/" },
    ],
  },
  {
    title: "커뮤니티",
    links: [
      { text: "인기 레시피", url: "/" },
      { text: "요리 팁", url: "/" },
      { text: "Q&A", url: "/" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { text: "자주 묻는 질문", url: "/" },
      { text: "문의하기", url: "/" },
      { text: "피드백", url: "/" },
    ],
  },
]

const bottomLinks = [
  { text: "이용약관", url: "/" },
  { text: "개인정보처리방침", url: "/" },
  { text: "쿠키 정책", url: "/" },
]

export function Footer() {
  return (
    <section className="py-24 bg-foreground">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Brand Section */}
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  <ChefHat className="h-5 w-5" />
                </div>
                <p className="text-xl font-semibold text-background">CookSync</p>
              </div>
              <p className="mt-4 font-bold text-background">AI 맞춤 레시피 플랫폼</p>
              <p className="mt-2 text-sm text-background/60 leading-relaxed">
                복잡한 레시피 검색, 이제 고민하지 마세요.
                <br />내 취향에 맞는 요리를 AI가 찾아드려요.
              </p>
            </div>

            {/* Menu Items */}
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-background">{section.title}</h3>
                <ul className="space-y-3 text-background/60">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="text-sm font-medium hover:text-background transition-colors">
                      <Link href={link.url}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-20 flex flex-col justify-between gap-4 border-t border-background/10 pt-8 text-sm font-medium text-background/40 md:flex-row md:items-center">
            <p>© 2025 CookSync. All rights reserved.</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="underline hover:text-background transition-colors">
                  <Link href={link.url}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  )
}

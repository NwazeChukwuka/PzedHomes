import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
    >
      <div className="absolute inset-0 bg-black/20" />
      <img
        src="/luxury-hotel-lobby-with-elegant-chandeliers-and-ma.jpg"
        alt="P-ZED Hotels Luxury Lobby"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
          Welcome to <span className="text-amber-400">P-ZED</span> Hotels & Suites
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-pretty max-w-3xl mx-auto">
          Experience luxury and comfort in the heart of the city. Where elegance meets exceptional service.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700" asChild>
            <Link href="/auth/register">Book Your Stay</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black bg-transparent"
            asChild
          >
            <Link href="#rooms">Explore Rooms</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

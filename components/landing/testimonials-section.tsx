"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Lagos, Nigeria",
    rating: 5,
    comment:
      "Exceptional service and luxurious accommodations. The Executive Suite exceeded all expectations. The staff was incredibly attentive and professional.",
    date: "December 2024",
  },
  {
    name: "Michael Chen",
    location: "Abuja, Nigeria",
    rating: 5,
    comment:
      "P-ZED Hotels provided the perfect venue for our corporate retreat. The conference facilities were top-notch and the catering was outstanding.",
    date: "November 2024",
  },
  {
    name: "Amara Okafor",
    location: "Port Harcourt, Nigeria",
    rating: 5,
    comment:
      "Beautiful hotel with amazing amenities. The spa services were incredibly relaxing and the restaurant food was delicious. Will definitely return!",
    date: "October 2024",
  },
  {
    name: "David Williams",
    location: "Kano, Nigeria",
    rating: 5,
    comment:
      "Outstanding hospitality from check-in to check-out. The Diplomatic Room was spacious and elegantly furnished. Highly recommend for business travelers.",
    date: "September 2024",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Guests Say</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Experience the luxury and exceptional service that makes P-ZED Hotels & Suites the preferred choice for
            discerning travelers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed">"{testimonial.comment}"</blockquote>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-500 text-sm">{testimonial.location}</div>
                  </div>
                  <div className="text-slate-400 text-sm">{testimonial.date}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { Award, Users, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Award,
    title: "5-Star Excellence",
    description: "Committed to providing world-class hospitality and luxury accommodations that exceed expectations.",
  },
  {
    icon: Users,
    title: "Professional Staff",
    description:
      "Our dedicated team of hospitality professionals ensures every guest receives personalized attention and care.",
  },
  {
    icon: MapPin,
    title: "Prime Location",
    description:
      "Strategically located to provide easy access to business districts, shopping centers, and cultural attractions.",
  },
  {
    icon: Clock,
    title: "24/7 Service",
    description: "Round-the-clock concierge and room service to cater to all your needs, any time of day or night.",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">About P-ZED Hotels & Suites</h2>
            <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
              <p>
                P-ZED Hotels & Suites stands as a beacon of luxury and sophistication in the hospitality industry. Since
                our establishment, we have been dedicated to creating unforgettable experiences for our guests through
                exceptional service, elegant accommodations, and world-class amenities.
              </p>
              <p>
                Our commitment to excellence is reflected in every aspect of our operations, from our meticulously
                designed rooms and suites to our award-winning restaurant and comprehensive business facilities. We
                pride ourselves on being more than just a hotel – we are your home away from home.
              </p>
              <p>
                Whether you're traveling for business or leisure, our team of dedicated professionals is committed to
                ensuring your stay exceeds expectations. Experience the perfect blend of luxury, comfort, and
                personalized service that defines the P-ZED difference.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

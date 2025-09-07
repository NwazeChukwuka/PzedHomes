import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, MapPin, Wifi, Car, Coffee, Utensils } from "lucide-react"
import Link from "next/link"

export default function GuestPortalHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PZ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">P-ZED Hotels & Suites</h1>
                <p className="text-xs text-slate-600">Luxury Redefined</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/guest/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/guest/register">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 text-balance">
            Experience Luxury at P-ZED Hotels & Suites
          </h2>
          <p className="text-xl text-slate-600 mb-8 text-pretty max-w-2xl mx-auto">
            Discover our premium accommodations with world-class amenities and exceptional service in the heart of the
            city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/guest/booking">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 px-8">
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Stay
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              <MapPin className="w-5 h-5 mr-2" />
              Virtual Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Room Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Our Premium Rooms</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose from our carefully designed room categories, each offering unique amenities and comfort levels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Standard Room",
                price: "₦15,000",
                features: ["Free WiFi", "Air Conditioning", "24/7 Room Service"],
              },
              { name: "Classic Room", price: "₦25,000", features: ["Premium Bedding", "Mini Bar", "City View"] },
              {
                name: "Diplomatic Suite",
                price: "₦35,000",
                features: ["Separate Living Area", "Executive Lounge", "Butler Service"],
              },
              { name: "Deluxe Suite", price: "₦40,000", features: ["Luxury Amenities", "Balcony", "Premium Location"] },
              {
                name: "Executive Suite",
                price: "₦50,000",
                features: ["Presidential Treatment", "Private Dining", "Concierge Service"],
              },
            ].map((room, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {room.price}/night
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {room.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600">
                        <Star className="w-4 h-4 mr-2 text-amber-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">Book Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">World-Class Amenities</h3>
            <p className="text-slate-600">Everything you need for a perfect stay</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Wifi, title: "Free High-Speed WiFi", desc: "Stay connected throughout your visit" },
              { icon: Car, title: "Valet Parking", desc: "Complimentary parking service" },
              { icon: Coffee, title: "24/7 Room Service", desc: "Dining at your convenience" },
              { icon: Utensils, title: "Fine Dining Restaurant", desc: "Exquisite culinary experiences" },
            ].map((amenity, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{amenity.title}</h4>
                <p className="text-sm text-slate-600">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PZ</span>
                </div>
                <span className="text-xl font-bold">P-ZED Hotels & Suites</span>
              </div>
              <p className="text-slate-400 text-sm">
                Experience luxury redefined with our premium accommodations and exceptional service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/guest/booking" className="hover:text-white">
                    Book a Room
                  </Link>
                </li>
                <li>
                  <Link href="/guest/login" className="hover:text-white">
                    Guest Portal
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>123 Luxury Avenue, Victoria Island</p>
                <p>Lagos, Nigeria</p>
                <p>+234 (0) 123 456 7890</p>
                <p>info@pzedhotels.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 P-ZED Hotels & Suites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

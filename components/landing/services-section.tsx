import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils, Car, Wifi, Dumbbell, Waves, Users } from "lucide-react"

const services = [
  {
    name: "Restaurant & Bar",
    description: "Fine dining experience with local and international cuisine",
    icon: Utensils,
    price: "₦2,000 - ₦15,000",
    images: ["/elegant-hotel-restaurant-with-fine-dining-setup.jpg", "/hotel-bar-with-premium-drinks-and-ambient-lighting.jpg"],
  },
  {
    name: "Valet Parking",
    description: "Secure parking with professional valet service",
    icon: Car,
    price: "₦1,000/day",
    images: ["/hotel-valet-parking-service-with-luxury-cars.jpg", "/secure-underground-hotel-parking-garage.jpg"],
  },
  {
    name: "High-Speed WiFi",
    description: "Complimentary high-speed internet throughout the property",
    icon: Wifi,
    price: "Complimentary",
    images: ["/hotel-business-center-with-computers-and-wifi.jpg", "/placeholder.svg?height=200&width=300"],
  },
  {
    name: "Fitness Center",
    description: "State-of-the-art gym equipment available 24/7",
    icon: Dumbbell,
    price: "Complimentary",
    images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  },
  {
    name: "Swimming Pool",
    description: "Outdoor pool with poolside service and relaxation area",
    icon: Waves,
    price: "Complimentary",
    images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  },
  {
    name: "Conference Rooms",
    description: "Professional meeting spaces for business events",
    icon: Users,
    price: "₦25,000 - ₦100,000",
    images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Premium Services</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Enjoy our comprehensive range of services designed to make your stay exceptional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {service.price}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 text-pretty">{service.description}</p>

                  <div className="grid grid-cols-2 gap-2">
                    {service.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image || "/placeholder.svg"}
                        alt={`${service.name} ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

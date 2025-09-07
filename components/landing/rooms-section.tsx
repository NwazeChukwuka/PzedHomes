import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const rooms = [
  {
    name: "Standard Room",
    price: "₦15,000",
    description: "Comfortable and affordable accommodation with essential amenities",
    features: ["Free WiFi", "Air Conditioning", "Private Bathroom", "TV"],
    images: ["/standard-hotel-room-with-single-bed-and-modern-fur.jpg", "/standard-hotel-room-bathroom-with-shower.jpg"],
  },
  {
    name: "Classic Room",
    price: "₦25,000",
    description: "Enhanced comfort with premium amenities and elegant decor",
    features: ["Free WiFi", "Air Conditioning", "Mini Fridge", "Work Desk", "Premium TV"],
    images: ["/classic-hotel-room-with-queen-bed-and-elegant-deco.jpg", "/classic-hotel-room-seating-area-with-comfortable-c.jpg"],
  },
  {
    name: "Diplomatic Room",
    price: "₦35,000",
    description: "Sophisticated accommodation designed for business travelers",
    features: ["Free WiFi", "Business Center Access", "Mini Bar", "Room Service", "Premium Bedding"],
    images: ["/diplomatic-hotel-room-with-business-desk-and-luxur.jpg", "/diplomatic-hotel-room-with-mini-bar-and-seating-ar.jpg"],
  },
  {
    name: "Deluxe Room",
    price: "₦40,000",
    description: "Spacious luxury room with premium amenities and city views",
    features: ["Free WiFi", "City View", "Luxury Bathroom", "Mini Bar", "24/7 Room Service"],
    images: ["/deluxe-hotel-room-with-king-bed-and-city-view.jpg", "/deluxe-hotel-room-luxury-bathroom-with-bathtub.jpg"],
  },
  {
    name: "Executive Room",
    price: "₦50,000",
    description: "Ultimate luxury experience with exclusive amenities and services",
    features: ["Free WiFi", "Executive Lounge Access", "Butler Service", "Premium Mini Bar", "Spa Access"],
    images: ["/executive-hotel-suite-with-separate-living-area-an.jpg", "/executive-hotel-room-with-panoramic-city-view-and-.jpg"],
  },
]

export function RoomsSection() {
  return (
    <section id="rooms" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Our Luxury Rooms</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Choose from our carefully designed rooms, each offering unique amenities and comfort levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={room.images[0] || "/placeholder.svg"} alt={room.name} className="w-full h-48 object-cover" />
                <Badge className="absolute top-4 right-4 bg-amber-600 hover:bg-amber-700">{room.price}/night</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                <p className="text-muted-foreground mb-4 text-pretty">{room.description}</p>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {room.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {room.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image || "/placeholder.svg"}
                      alt={`${room.name} ${idx + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>

                <Button className="w-full" asChild>
                  <Link href="/auth/register">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

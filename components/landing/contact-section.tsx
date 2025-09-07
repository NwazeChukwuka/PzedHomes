"use client"

import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["08157505978"],
    description: "24/7 Customer Support",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["pzedglobal@gmail.com"],
    description: "Quick Response Guaranteed",
  },
  {
    icon: MapPin,
    title: "Address",
    details: [
      "2 Unity fm road, off Nwiboko enigwe street",
      "by Unity fm junction, amike aba",
      "Abakaliki, Ebonyi State",
    ],
    description: "Prime Location",
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Reception: 24/7", "Restaurant: 6:00 AM - 11:00 PM"],
    description: "Always Here for You",
  },
]

export function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Get In Touch</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ready to experience luxury? Contact us for reservations, inquiries, or to learn more about our exceptional
            services and amenities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-8">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-slate-50 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                        <info.icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{info.title}</h4>
                        <p className="text-sm text-slate-500">{info.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-slate-700">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-8">Send Us a Message</h3>
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <Input placeholder="Your first name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <Input placeholder="Your last name" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <Input type="email" placeholder="your.email@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <Input type="tel" placeholder="+234 (0) 123 456 7890" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                    <Input placeholder="How can we help you?" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <Textarea placeholder="Tell us more about your inquiry or reservation needs..." rows={5} />
                  </div>

                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

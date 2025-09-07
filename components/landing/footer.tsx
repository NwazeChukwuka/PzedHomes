"use client"

import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  hotel: [
    { name: "About Us", href: "#about" },
    { name: "Rooms & Suites", href: "#rooms" },
    { name: "Services", href: "#services" },
    { name: "Testimonials", href: "#testimonials" },
  ],
  services: [
    { name: "Restaurant & Bar", href: "#services" },
    { name: "Conference Facilities", href: "#services" },
    { name: "Spa & Wellness", href: "#services" },
    { name: "Airport Shuttle", href: "#services" },
  ],
  support: [
    { name: "Contact Us", href: "#contact" },
    { name: "Guest Login", href: "/guest/login" },
    { name: "Staff Portal", href: "/auth/login" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold">P-ZED Hotels</span>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Experience luxury and sophistication at P-ZED Hotels & Suites. Your premier destination for exceptional
              hospitality and world-class amenities.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Hotel Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Hotel</h3>
            <ul className="space-y-3">
              {footerLinks.hotel.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-slate-300 hover:text-amber-400 transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                <div className="text-slate-300">
                  <p>123 Luxury Avenue</p>
                  <p>Victoria Island, Lagos, Nigeria</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                <span className="text-slate-300">+234 (0) 123 456 7890</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                <span className="text-slate-300">info@pzedhotels.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">© 2024 P-ZED Hotels & Suites. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-amber-400 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-amber-400 transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

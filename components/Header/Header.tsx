'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Moon, Sun } from "lucide-react"
import PublicNavbar from "../PublicNavbar/PublicNavbar"
import MenuList from "../MenuList"
import DigitalClock from "../DigitalClock"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const Header = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-2">
        {/* Top Navbar */}
        <div className="flex justify-between items-center py-2 border-b">
          <DigitalClock />
          <div className="flex items-center space-x-4">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            <Link href="/auth/login" passHref>
              <Button variant="outline" className="text-primary">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Logo and Main Navigation */}
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex-shrink-0" aria-label="Home">
            <Image
              src="/images/logo-no-background.svg"
              width={120}
              height={40}
              alt="Dhalpara Gram Panchayat Logo"
              sizes="(max-width: 768px) 80px, 120px"
              priority
            />
          </Link>

          {/* Public Navbar */}
          <nav aria-label="Main navigation" className="md:block">
            <PublicNavbar />
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

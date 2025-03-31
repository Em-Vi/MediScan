"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Contact Us</CardTitle>
            <CardDescription className="text-center">
              Have questions or feedback? We'd love to hear from you.
            </CardDescription>
          </CardHeader>

          {isSubmitted ? (
            <CardContent className="space-y-4 pt-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <h3 className="font-medium text-lg mb-2">Thank you for your message!</h3>
                <p className="text-muted-foreground">
                  We've received your inquiry and will get back to you as soon as possible.
                </p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input placeholder="Your Name" required disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Input type="email" placeholder="Your Email" required disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Input placeholder="Subject" required disabled={isSubmitting} />
                </div>

                <div className="space-y-2">
                  <Textarea placeholder="Your Message" rows={5} required disabled={isSubmitting} />
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </main>
    </div>
  )
}


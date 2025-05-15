"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Edit2, Save, Calendar, Clock, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { useApp } from "@/contexts/app-context"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    }

    if (user) {
      setUserData({
        name: user.username,
        email: user.email,
      })
      setFormData({
        name: user.username,
        email: user.email,
      })
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setUserData(formData)
      setIsEditing(false)
      setIsSaving(false)
    }, 1000)
  }

  if (isLoading || !user) {
    return <LoadingScreen message="Loading your profile..." />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isEditing) {
                    handleSave()
                  } else {
                    setIsEditing(true)
                  }
                }}
                disabled={isSaving}
                className="rounded-full"
              >
                {isEditing ? (
                  <Save className={`h-5 w-5 ${isSaving ? "animate-pulse" : "text-medical-green"}`} />
                ) : (
                  <Edit2 className="h-5 w-5" />
                )}
                <span className="sr-only">{isEditing ? "Save" : "Edit"}</span>
              </Button>
            </div>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    disabled={isSaving}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="transition-all duration-300"
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/30">{userData.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="transition-all duration-300"
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/30">{userData.email}</div>
                )}
              </div>

              <div className="pt-2">
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "N/A"}
                      {user.lastLogin
                        ? ` at ${new Date(user.lastLogin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          {isEditing && (
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: userData.name,
                    email: userData.email,
                  })
                  setIsEditing(false)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  )
}


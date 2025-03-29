"use client"

import { useState } from "react"
import { SettingsIcon, Save, Bell, Lock, Globe, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { useApp } from "@/contexts/app-context"

export default function SettingsPage() {
  const { theme, setTheme } = useApp()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="appearance">
          <TabsList className="mb-6">
            <TabsTrigger value="appearance">
              <Monitor className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="language">
              <Globe className="h-4 w-4 mr-2" />
              Language
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how MediScan looks on your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${theme === "light" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="h-20 bg-white border rounded-md mb-2 flex items-center justify-center text-black">
                        Light Mode
                      </div>
                      <p className="text-sm font-medium">Light</p>
                      <p className="text-xs text-muted-foreground">Light background with dark text</p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="h-20 bg-slate-900 border rounded-md mb-2 flex items-center justify-center text-white">
                        Dark Mode
                      </div>
                      <p className="text-sm font-medium">Dark</p>
                      <p className="text-xs text-muted-foreground">Dark background with light text</p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${theme === "light-custom" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                      onClick={() => setTheme("light-custom")}
                    >
                      <div className="h-20 bg-teal-50 border rounded-md mb-2 flex items-center justify-center text-teal-900">
                        Custom Light
                      </div>
                      <p className="text-sm font-medium">Custom Light</p>
                      <p className="text-xs text-muted-foreground">Teal-accented light theme</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Interface Density</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use a more compact user interface</p>
                    </div>
                    <Switch id="compact-mode" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Animations</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reduce-motion">Reduce Motion</Label>
                      <p className="text-sm text-muted-foreground">Reduce the amount of animations</p>
                    </div>
                    <Switch id="reduce-motion" />
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90"
                >
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Notification settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Manage your privacy settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Privacy settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>Choose your preferred language</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Language settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


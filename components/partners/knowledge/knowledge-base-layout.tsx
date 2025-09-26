"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BestPractices } from "./content/best-practices"
import { TechnicalGuides } from "./content/technical-guides"
import { FAQSection } from "./content/faq-section"
import { VideoTutorials } from "./content/video-tutorials"
import { Troubleshooting } from "./content/troubleshooting"
import { SearchBar } from "./organization/search-bar"
import { CategoryNavigation } from "./organization/category-navigation"
import { LanguageSelector } from "./organization/language-selector"

export function KnowledgeBaseLayout() {
  const [language, setLanguage] = useState("en")

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Partner Knowledge Base</h1>
        <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
      </div>

      <div className="flex gap-6">
        <div className="w-1/4">
          <CategoryNavigation language={language} />
        </div>

        <div className="w-3/4 space-y-6">
          <SearchBar language={language} />

          <Tabs defaultValue="best-practices">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
              <TabsTrigger value="technical-guides">Technical Guides</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="video-tutorials">Video Tutorials</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            </TabsList>

            <TabsContent value="best-practices">
              <BestPractices language={language} />
            </TabsContent>

            <TabsContent value="technical-guides">
              <TechnicalGuides language={language} />
            </TabsContent>

            <TabsContent value="faq">
              <FAQSection language={language} />
            </TabsContent>

            <TabsContent value="video-tutorials">
              <VideoTutorials language={language} />
            </TabsContent>

            <TabsContent value="troubleshooting">
              <Troubleshooting language={language} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

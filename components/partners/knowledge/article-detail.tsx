"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, FileText, MessageSquare, ThumbsUp, Flag, Download, Share2 } from "lucide-react"
import { CommentSection } from "./collaboration/comment-section"
import { VersionHistory } from "./organization/version-history"
import { LanguageSelector } from "./organization/language-selector"
import { translations } from "./translations"

interface ArticleDetailProps {
  id: number
}

export function ArticleDetail({ id }: ArticleDetailProps) {
  const router = useRouter()
  const [language, setLanguage] = useState("en")
  const [activeTab, setActiveTab] = useState("content")

  const t = (translations as any)[language] || translations.en

  // Mock article data - in a real app, this would be fetched based on the ID
  const article = {
    id: id,
    title: "Prong Setting Techniques for Diamonds",
    description: "Step-by-step guide to properly set diamonds using prong settings.",
    category: "Gemstone Setting",
    lastUpdated: "2023-04-18",
    version: "2.1",
    content: `
      <h2>Introduction to Prong Settings</h2>
      <p>Prong settings are one of the most popular methods for setting diamonds and other gemstones. They use small metal claws to hold the stone securely in place while allowing maximum light exposure.</p>
      
      <h2>Tools Required</h2>
      <ul>
        <li>Setting pliers</li>
        <li>Stone setting burs</li>
        <li>Beading tools</li>
        <li>Loupe or microscope</li>
        <li>Fine files</li>
      </ul>
      
      <h2>Step 1: Preparing the Setting</h2>
      <p>Begin by examining the prongs to ensure they are properly aligned and of equal height. File if necessary to create a level surface for the stone to sit on.</p>
      
      <h2>Step 2: Creating the Seat</h2>
      <p>Use a setting bur to create a seat for the stone at the same height on each prong. The seat should be slightly below the widest part of the stone (the girdle).</p>
      
      <h2>Step 3: Placing the Stone</h2>
      <p>Carefully place the stone into the setting, ensuring it sits level and the table (top facet) is parallel to the base of the setting.</p>
      
      <h2>Step 4: Securing the Stone</h2>
      <p>Using setting pliers, carefully bend each prong over the stone's crown. Work in a diagonal pattern (e.g., north, south, east, west) to maintain even pressure.</p>
      
      <h2>Step 5: Finishing the Prongs</h2>
      <p>File the prongs to the desired length and shape. They should be secure but not overly visible from the top view. Finish with polishing to create a smooth surface.</p>
      
      <h2>Common Issues and Solutions</h2>
      <p>If a prong breaks during setting, it may need to be rebuilt or the setting replaced. If the stone sits unevenly, recheck your seat depths and adjust as necessary.</p>
      
      <h2>Quality Control</h2>
      <p>After setting, check that the stone is secure by gently testing each prong. Examine under magnification to ensure no damage has occurred to the stone during the setting process.</p>
    `,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Base
        </Button>
        <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{article.description}</p>
            </div>
            <Badge>{article.category}</Badge>
          </div>

          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="mr-4">
              {t.article.lastUpdated}: {article.lastUpdated}
            </span>

            <FileText className="h-4 w-4 mr-1" />
            <span>
              {t.article.version}: {article.version}
            </span>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content">
            <CardContent>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
            </CardContent>
          </TabsContent>

          <TabsContent value="comments">
            <CardContent>
              <CommentSection articleId={article.id} language={language} />
            </CardContent>
          </TabsContent>

          <TabsContent value="history">
            <CardContent>
              <VersionHistory articleId={article.id} language={language} />
            </CardContent>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between border-t p-6">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{t.article.helpful}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setActiveTab("comments")}>
              <MessageSquare className="h-4 w-4" />
              <span>{t.article.comments}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Flag className="h-4 w-4" />
              <span>{t.article.requestUpdate}</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

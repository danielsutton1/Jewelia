import type { Metadata } from "next"
import { ArticleDetail } from "@/components/partners/knowledge/article-detail"

export const metadata: Metadata = {
  title: "Article Detail | Partner Knowledge Base",
  description: "Detailed article from the partner knowledge base",
}

interface ArticleDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const resolvedParams = await params;
  return <ArticleDetail id={Number.parseInt(resolvedParams.id)} />
}

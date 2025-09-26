import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { translations } from "../translations"

interface FAQSectionProps {
  language: string
}

export function FAQSection({ language }: FAQSectionProps) {
  const t = (translations as any)[language] || translations.en

  const faqs = [
    {
      id: "faq-1",
      question: t.faq.items[0].question,
      answer: t.faq.items[0].answer,
    },
    {
      id: "faq-2",
      question: t.faq.items[1].question,
      answer: t.faq.items[1].answer,
    },
    {
      id: "faq-3",
      question: t.faq.items[2].question,
      answer: t.faq.items[2].answer,
    },
    {
      id: "faq-4",
      question: t.faq.items[3].question,
      answer: t.faq.items[3].answer,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.faq.title}</CardTitle>
        <CardDescription>{t.faq.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

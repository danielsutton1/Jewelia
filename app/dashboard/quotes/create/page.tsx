'use client';
import { QuoteCreator } from "@/components/quotes/quote-creator"
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CreateQuoteContent() {
  const searchParams = useSearchParams();
  // Map query params to initialQuoteDetails fields, only include defined values
  const initialQuoteDetails: any = {};
  
  const customerName = searchParams.get("customerName");
  const customerEmail = searchParams.get("customerEmail");
  const customerPhone = searchParams.get("customerPhone");
  const customerAddress = searchParams.get("customerAddress");
  const notes = searchParams.get("notes");
  const assignee = searchParams.get("assignee");
  
  if (customerName) initialQuoteDetails.customerName = customerName;
  if (customerEmail) initialQuoteDetails.customerEmail = customerEmail;
  if (customerPhone) initialQuoteDetails.customerPhone = customerPhone;
  if (customerAddress) initialQuoteDetails.customerAddress = customerAddress;
  if (notes) initialQuoteDetails.notes = notes;
  if (assignee) initialQuoteDetails.assignee = assignee;
  
  return <QuoteCreator initialQuoteDetails={initialQuoteDetails} />;
}

export default function CreateQuotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateQuoteContent />
    </Suspense>
  );
}

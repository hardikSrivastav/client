"use client"

import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronLeft, Home } from "lucide-react"

export default function ThankYouPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Form Submitted" />
      
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
              <CardDescription className="text-center">
                Your form submission has been received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 dark:text-gray-400">
                We appreciate you taking the time to complete this survey. Your feedback is valuable to us.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/survey/forms/${formId}`)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Form
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
} 
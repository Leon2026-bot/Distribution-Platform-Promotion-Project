import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900">Edit Blog Post</h1>
      <p className="text-sm text-zinc-500">
        Blog editor coming soon.
      </p>
    </div>
  )
}

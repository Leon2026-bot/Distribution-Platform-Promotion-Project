import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/webp",
]

const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const serviceClient = createServiceClient()

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed: png, jpg, svg, ico, webp` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 })
    }

    // Ensure bucket exists
    const { data: buckets } = await serviceClient.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === "site-assets")

    if (!bucketExists) {
      await serviceClient.storage.createBucket("site-assets", {
        public: true,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      })
    }

    // Generate unique path
    const ext = file.name.split(".").pop() || "png"
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).slice(2, 8)
    const filePath = `${folder}/${timestamp}-${randomSuffix}.${ext}`

    // Upload
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await serviceClient.storage
      .from("site-assets")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from("site-assets")
      .getPublicUrl(filePath)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    )
  }
}

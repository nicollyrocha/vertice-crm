import "server-only"
import { del, put } from "@vercel/blob"

const allowed = new Set(["image/jpeg", "image/png", "image/webp"])
const maxBytes = 2 * 1024 * 1024

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

export async function uploadImage(file: FormDataEntryValue | null, folder: string): Promise<UploadResult> {
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione uma imagem." }
  if (!allowed.has(file.type)) return { ok: false, error: "Use JPG, PNG ou WEBP." }
  if (file.size > maxBytes) return { ok: false, error: "A imagem deve ter no máximo 2 MB." }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "Upload indisponível: configure BLOB_READ_WRITE_TOKEN (Vercel Blob)." }
  }
  const ext = file.type.split("/")[1]
  const blob = await put(`${folder}/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  })
  return { ok: true, url: blob.url }
}

/** Remove imagem antiga do Blob; falhas não bloqueiam o fluxo. */
export async function deleteImage(url: string | null | undefined) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN || !url.includes(".blob.vercel-storage.com")) return
  try {
    await del(url)
  } catch (error) {
    console.warn("[blob] falha ao remover", error)
  }
}

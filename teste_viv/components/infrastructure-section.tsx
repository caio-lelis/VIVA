"use client"

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { API_BASE_URL } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, ChevronLeft, ChevronRight, Loader2, PencilLine, Plus, Save, Trash2, Upload } from "lucide-react"

type Role = "admin" | "morador"

type InfraItem = {
  id: string
  title: string
  description: string
  imageKey: string
  imageUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export function InfrastructureSection() {
  const [role, setRole] = useState<Role | null>(null)
  const [items, setItems] = useState<InfraItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newImageKey, setNewImageKey] = useState("")
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editImageKey, setEditImageKey] = useState("")
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)

  const isAdmin = role === "admin"

  const loadRole = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (!response.ok) {
        setRole(null)
        return
      }
      const payload = await response.json()
      if (payload?.role === "admin" || payload?.role === "morador") {
        setRole(payload.role)
      }
    } catch {
      setRole(null)
    }
  }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/infraestrutura/items`, { cache: "no-store" })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Falha ao carregar infraestrutura")
      }
      const payload = await response.json()
      setItems(Array.isArray(payload?.items) ? payload.items : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar infraestrutura")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRole()
    void loadItems()
  }, [loadRole, loadItems])

  useEffect(() => {
    setSelectedIndex((current) => {
      if (sortedItems.length === 0) return 0
      return Math.min(current, sortedItems.length - 1)
    })
  }, [items.length])

  useEffect(() => {
    return () => {
      if (newImagePreview) URL.revokeObjectURL(newImagePreview)
      if (editImagePreview) URL.revokeObjectURL(editImagePreview)
    }
  }, [editImagePreview, newImagePreview])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a.createdAt || ""
      const second = b.createdAt || ""
      return second.localeCompare(first)
    })
  }, [items])

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/api/infraestrutura/upload-imagem`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Falha no upload da imagem")
    }

    const payload = await response.json()
    return String(payload?.key || "")
  }

  const onUploadNewImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setNewImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return previewUrl
    })
    setUploading(true)
    setError("")
    try {
      const key = await uploadImage(file)
      setNewImageKey(key)
      setSuccess("Imagem enviada para a infraestrutura.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const onCreateItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/infraestrutura/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          imageKey: newImageKey,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Falha ao criar item")
      }

      setNewTitle("")
      setNewDescription("")
      setNewImageKey("")
      setNewImagePreview((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return null
      })
      setSuccess("Infraestrutura adicionada com sucesso.")
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar infraestrutura")
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (item: InfraItem) => {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditDescription(item.description)
    setEditImageKey(item.imageKey || "")
    setEditImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
  }

  const onUploadEditImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setEditImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return previewUrl
    })
    setUploading(true)
    setError("")
    try {
      const key = await uploadImage(file)
      setEditImageKey(key)
      setSuccess("Imagem atualizada para este item.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const saveEditing = async () => {
    if (!editingId) return
    setSaving(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/infraestrutura/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          imageKey: editImageKey,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Falha ao atualizar item")
      }
      setEditingId(null)
      setEditImagePreview((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return null
      })
      setSuccess("Item atualizado com sucesso.")
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar item")
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (id: string) => {
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`${API_BASE_URL}/api/infraestrutura/items/${id}`, { method: "DELETE" })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Falha ao excluir item")
      }
      if (editingId === id) {
        setEditingId(null)
        setEditImagePreview((previous) => {
          if (previous) URL.revokeObjectURL(previous)
          return null
        })
      }
      setSuccess("Item removido com sucesso.")
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir item")
    } finally {
      setSaving(false)
    }
  }

  const selectedItem = sortedItems[selectedIndex] ?? null

  const resolveImageUrl = (item: InfraItem) => {
    return item.imageUrl ? `${API_BASE_URL}${item.imageUrl}` : "/img/viva-sobre.jpg"
  }

  return (
    <section id="infraestrutura" className="pb-8 md:pb-10">
      <article className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent">INFRAESTRUTURA</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Conheça nossa infraestrutura</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Piscina, academia, área de lazer, quadra esportiva, sala de estudos e outros espaços do Condomínio VIVA.
            </p>
          </div>
          {isAdmin ? (
            <Badge className="border border-border bg-secondary text-foreground">Modo administrador ativo</Badge>
          ) : (
            <Badge className="border border-border bg-background text-muted-foreground">Visualização pública</Badge>
          )}
        </div>

        {error && <p className="mt-4 rounded-lg border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        {isAdmin && (
          <details className="mb-8 rounded-xl border border-border bg-secondary/35 p-4" open>
            <summary className="cursor-pointer select-none text-sm font-semibold text-foreground">
              Painel administrativo de infraestrutura
            </summary>

            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateItem}>
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Título (ex: Piscina)"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none"
                required
              />
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Enviar imagem
                <input type="file" accept="image/*" className="hidden" onChange={onUploadNewImage} />
              </label>
              <textarea
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Descrição"
                className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none md:col-span-2"
                required
              />
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground">Chave da imagem: {newImageKey || "nenhuma"}</p>
                {newImagePreview && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border">
                    <img src={newImagePreview} alt="Prévia da nova imagem" className="h-40 w-full object-cover" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="rounded-lg" disabled={saving || uploading}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Adicionar ambiente
                </Button>
              </div>
            </form>
          </details>
        )}

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados de infraestrutura...
          </div>
        ) : (
          <>
            {sortedItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-secondary/30 p-6 text-sm text-muted-foreground">
                Nenhum ambiente cadastrado no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedItem && (
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <div className="relative h-[280px] md:h-[420px]">
                      <img src={resolveImageUrl(selectedItem)} alt={selectedItem.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(21,33,43,0.65)] via-[rgba(21,33,43,0.2)] to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                        <p className="text-xs font-semibold tracking-[0.22em] text-accent">AMBIENTE EM DESTAQUE</p>
                        <h3 className="mt-1 text-2xl font-semibold text-white md:text-3xl">{selectedItem.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm text-white/90 md:text-base">{selectedItem.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-lg border-border bg-card text-foreground hover:bg-secondary"
                          onClick={() => setSelectedIndex((current) => (current - 1 + sortedItems.length) % sortedItems.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-lg border-border bg-card text-foreground hover:bg-secondary"
                          onClick={() => setSelectedIndex((current) => (current + 1) % sortedItems.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedIndex + 1} de {sortedItems.length}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={[
                        "overflow-hidden rounded-xl border text-left transition",
                        index === selectedIndex
                          ? "border-primary/40 bg-secondary/35"
                          : "border-border bg-card hover:border-primary/30",
                      ].join(" ")}
                    >
                      <div className="h-24 w-full">
                        <img src={resolveImageUrl(item)} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {isAdmin && sortedItems.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-secondary/30 p-4">
            <h3 className="text-sm font-semibold tracking-[0.14em] text-foreground">Gerenciamento dos ambientes</h3>
            <div className="mt-3 space-y-3">
              {sortedItems.map((item) => {
                const isEditing = editingId === item.id
                return (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          className="min-h-20 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none"
                        />
                        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-2 text-xs">
                          <Upload className="h-3.5 w-3.5" /> Trocar imagem
                          <input type="file" accept="image/*" className="hidden" onChange={onUploadEditImage} />
                        </label>
                        {editImagePreview && (
                          <div className="overflow-hidden rounded-lg border border-border">
                            <img src={editImagePreview} alt="Prévia da edição" className="h-28 w-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" className="rounded-lg" onClick={saveEditing} disabled={saving || uploading}>
                            <Save className="mr-1 h-3.5 w-3.5" /> Salvar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-border bg-background text-foreground hover:bg-secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-border bg-background text-foreground hover:bg-secondary"
                            onClick={() => startEditing(item)}
                          >
                            <PencilLine className="mr-1 h-3.5 w-3.5" /> Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg"
                            variant="destructive"
                            onClick={() => removeItem(item.id)}
                            disabled={saving}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" /> Conteúdo atualizado dinamicamente pelo portal administrativo.
        </div>
      </article>
    </section>
  )
}

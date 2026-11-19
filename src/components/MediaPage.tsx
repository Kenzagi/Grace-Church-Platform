'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Search, Plus, Music, Video, FileText, MoreHorizontal, Trash2, Loader2, Disc3, Mic
} from 'lucide-react'
import { toast } from 'sonner'

interface MediaPageProps {
  tags: any[]
  members: any[]
  series: any[]
}

export default function MediaPage({ tags, members, series }: MediaPageProps) {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '', type: 'audio', description: '', date: '',
    seriesId: '', speakerId: '', status: 'published',
  })
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter) params.set('type', typeFilter)

      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()
      setMedia(data.media || [])
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tagIds: selectedTagIds }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create media item')
        return
      }

      toast.success('Media item created')
      setDialogOpen(false)
      setFormData({ title: '', type: 'audio', description: '', date: '', seriesId: '', speakerId: '', status: 'published' })
      setSelectedTagIds([])
      fetchMedia()
    } catch {
      toast.error('Failed to create media item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media item?')) return

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Media item deleted')
        fetchMedia()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="h-5 w-5 text-violet-500" />
      case 'video': return <Video className="h-5 w-5 text-rose-500" />
      default: return <FileText className="h-5 w-5 text-amber-500" />
    }
  }

  const typeBadge = (type: string) => {
    switch (type) {
      case 'audio': return 'bg-violet-100 text-violet-700'
      case 'video': return 'bg-rose-100 text-rose-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">{media.length} media items</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Media
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 cursor-text"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px] cursor-pointer">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
            <SelectItem value="audio" className="cursor-pointer">Audio</SelectItem>
            <SelectItem value="video" className="cursor-pointer">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Disc3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No media items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {media.map((item: any) => (
            <Card key={item.id} className="group hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      {typeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${typeBadge(item.type)}`}>
                          {item.type}
                        </Badge>
                        {item.speaker && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.speaker.firstName} {item.speaker.lastName}
                          </span>
                        )}
                      </div>
                      {item.series && (
                        <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                          {item.series.name}
                        </Badge>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.tags.slice(0, 3).map((t: any) => (
                            <span key={t.tagId} className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.tag.color }} />
                              {t.tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="cursor-pointer text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {item.date && (
                  <p className="text-xs text-muted-foreground mt-2">{item.date}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Media Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Media Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                className="cursor-text"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio" className="cursor-pointer">Audio</SelectItem>
                    <SelectItem value="video" className="cursor-pointer">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published" className="cursor-pointer">Published</SelectItem>
                    <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="cursor-text"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-1">
                <Label>Series</Label>
                <Select value={formData.seriesId || 'none'} onValueChange={(v) => setFormData(p => ({ ...p, seriesId: v === 'none' ? '' : v }))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                    {series.map((s: any) => (
                      <SelectItem key={s.id} value={s.id} className="cursor-pointer">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Speaker</Label>
              <Select value={formData.speakerId || 'none'} onValueChange={(v) => setFormData(p => ({ ...p, speakerId: v === 'none' ? '' : v }))}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.id} className="cursor-pointer">
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t: any) => (
                  <Badge
                    key={t.id}
                    variant={selectedTagIds.includes(t.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(t.id)}
                  >
                    <span className="h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

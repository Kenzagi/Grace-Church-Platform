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
  Search, Plus, Calendar as CalendarIcon, List, MoreHorizontal, Trash2, Edit, Loader2, MapPin, Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface EventsPageProps {
  tags: any[]
}

export default function EventsPage({ tags }: EventsPageProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '', description: '', startTime: '', endTime: '', location: '', category: 'service',
  })
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter) params.set('category', categoryFilter)

      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const openAddDialog = () => {
    setEditingEvent(null)
    setFormData({ title: '', description: '', startTime: '', endTime: '', location: '', category: 'service' })
    setSelectedTagIds([])
    setDialogOpen(true)
  }

  const openEditDialog = (event: any) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
      location: event.location || '',
      category: event.category,
    })
    setSelectedTagIds(event.tags?.map((t: any) => t.tagId) || [])
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.startTime) {
      toast.error('Title and start time are required')
      return
    }

    setSaving(true)
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tagIds: selectedTagIds }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save event')
        return
      }

      toast.success(editingEvent ? 'Event updated' : 'Event created')
      setDialogOpen(false)
      fetchEvents()
    } catch {
      toast.error('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Event deleted')
        fetchEvents()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'service': return 'bg-emerald-100 text-emerald-700'
      case 'fellowship': return 'bg-blue-100 text-blue-700'
      case 'study': return 'bg-violet-100 text-violet-700'
      case 'outreach': return 'bg-amber-100 text-amber-700'
      case 'conference': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
  }

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    })
  }

  // Group events by month for calendar view
  const groupedEvents = events.reduce((acc: any, event: any) => {
    const monthKey = new Date(event.startTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">{events.length} events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none cursor-pointer"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-l-none cursor-pointer"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 cursor-text"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px] cursor-pointer">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Categories</SelectItem>
            <SelectItem value="service" className="cursor-pointer">Service</SelectItem>
            <SelectItem value="fellowship" className="cursor-pointer">Fellowship</SelectItem>
            <SelectItem value="study" className="cursor-pointer">Study</SelectItem>
            <SelectItem value="outreach" className="cursor-pointer">Outreach</SelectItem>
            <SelectItem value="conference" className="cursor-pointer">Conference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No events found</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {events.map((event: any) => (
            <Card key={event.id} className="group hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openEditDialog(event)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex flex-col items-center rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 min-w-[60px] shrink-0">
                      <span className="text-xs font-medium">{formatDate(event.startTime).split(' ')[0]}</span>
                      <span className="text-sm font-medium">{formatDate(event.startTime).split(' ')[1]}</span>
                      <span className="text-lg font-bold leading-tight">{new Date(event.startTime).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(event.startTime)}
                          {event.endTime && ` – ${formatTime(event.endTime)}`}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${categoryColor(event.category)}`}>
                          {event.category}
                        </Badge>
                        {event.tags?.map((t: any) => (
                          <Badge key={t.tagId} variant="outline" className="text-[10px] px-1.5 py-0">
                            <span className="h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: t.tag.color }} />
                            {t.tag.name}
                          </Badge>
                        ))}
                        {event._count?.attendances > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {event._count.attendances} attending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(event) }} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(event.id) }} className="cursor-pointer text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([month, monthEvents]: [string, any]) => (
            <div key={month}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{month}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {monthEvents.map((event: any) => (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => openEditDialog(event)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-2">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                          {new Date(event.startTime).getDate()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(event.startTime)}</p>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 mt-1 ${categoryColor(event.category)}`}>
                            {event.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
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
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
                  className="cursor-text"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service" className="cursor-pointer">Service</SelectItem>
                    <SelectItem value="fellowship" className="cursor-pointer">Fellowship</SelectItem>
                    <SelectItem value="study" className="cursor-pointer">Study</SelectItem>
                    <SelectItem value="outreach" className="cursor-pointer">Outreach</SelectItem>
                    <SelectItem value="conference" className="cursor-pointer">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

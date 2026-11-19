'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Search, Plus, Download, Filter, X, MoreHorizontal, Edit, Trash2,
  ArrowUpAZ, ArrowDownZA, ArrowUpDown, Camera, Upload, Loader2, FileSpreadsheet, FileText
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface MembersPageProps {
  initialMembers?: any[]
  groups: any[]
  tags: any[]
}

export default function MembersPage({ initialMembers, groups, tags }: MembersPageProps) {
  const [members, setMembers] = useState(initialMembers || [])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', address: '', status: 'active', photo: '',
  })
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (groupFilter) params.set('groupId', groupFilter)
      if (tagFilter) params.set('tagId', tagFilter)
      params.set('sortField', sortField)
      params.set('sortOrder', sortOrder)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/members?${params}`)
      const data = await res.json()
      if (data.members) {
        setMembers(data.members)
        setTotal(data.total)
      }
    } catch (err) {
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, groupFilter, tagFilter, sortField, sortOrder, page])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const activeFilterCount = [statusFilter, groupFilter, tagFilter].filter(Boolean).length

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
    return sortOrder === 'asc'
      ? <ArrowUpAZ className="h-3.5 w-3.5 text-emerald-600" />
      : <ArrowDownZA className="h-3.5 w-3.5 text-emerald-600" />
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'visitor': return 'bg-blue-100 text-blue-700'
      case 'inactive': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const statusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500'
      case 'visitor': return 'bg-blue-500'
      case 'inactive': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const openAddDialog = () => {
    setEditingMember(null)
    setFormData({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', address: '', status: 'active', photo: '' })
    setSelectedGroupIds([])
    setSelectedTagIds([])
    setPhotoPreview('')
    setDialogOpen(true)
  }

  const openEditDialog = (member: any) => {
    setEditingMember(member)
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || '',
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth || '',
      address: member.address || '',
      status: member.status,
      photo: member.photo || '',
    })
    setSelectedGroupIds(member.memberships?.map((m: any) => m.groupId) || [])
    setSelectedTagIds(member.tags?.map((t: any) => t.tagId) || [])
    setPhotoPreview(member.photo || '')
    setDialogOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formDataToSend })
      const data = await res.json()
      if (data.filePath) {
        setFormData(prev => ({ ...prev, photo: data.filePath }))
        setPhotoPreview(data.filePath)
        toast.success('Photo uploaded')
      }
    } catch {
      toast.error('Failed to upload photo')
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }))
    setPhotoPreview('')
  }

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required')
      return
    }

    setSaving(true)
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          groupIds: selectedGroupIds,
          tagIds: selectedTagIds,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to save member')
        return
      }

      toast.success(editingMember ? 'Member updated' : 'Member added')
      setDialogOpen(false)
      fetchMembers()
    } catch {
      toast.error('Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (member: any) => {
    if (!confirm(`Delete ${member.firstName} ${member.lastName}?`)) return

    try {
      const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Member deleted')
        fetchMembers()
      } else {
        toast.error('Failed to delete member')
      }
    } catch {
      toast.error('Failed to delete member')
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const params = new URLSearchParams()
      params.set('export', format)
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (groupFilter) params.set('groupId', groupFilter)
      if (tagFilter) params.set('tagId', tagFilter)
      params.set('sortField', sortField)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/members?${params}`)
      const data = await res.json()

      if (!data.members || !data.export) {
        toast.error('Failed to export')
        return
      }

      const ws = XLSX.utils.json_to_sheet(data.members)

      // Auto-fit column widths
      const colWidths = Object.keys(data.members[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...data.members.map((row: any) => String(row[key] || '').length)
        ) + 2,
      }))
      ws['!cols'] = colWidths

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Members')

      const timestamp = new Date().toISOString().slice(0, 10)

      if (format === 'xlsx') {
        XLSX.writeFile(wb, `members_export_${timestamp}.xlsx`)
      } else {
        XLSX.writeFile(wb, `members_export_${timestamp}.csv`)
      }

      toast.success(`Exported ${data.members.length} members as ${format.toUpperCase()}`)
    } catch (err) {
      toast.error('Export failed')
    }
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    )
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setStatusFilter('')
    setGroupFilter('')
    setTagFilter('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground">{total} total members</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')} className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel (.xlsx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 cursor-text"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer relative">
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Statuses</SelectItem>
                    <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                    <SelectItem value="visitor" className="cursor-pointer">Visitor</SelectItem>
                    <SelectItem value="inactive" className="cursor-pointer">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Group / Ministry</Label>
                <Select value={groupFilter} onValueChange={(v) => { setGroupFilter(v === 'all' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Groups</SelectItem>
                    {groups.map((g: any) => (
                      <SelectItem key={g.id} value={g.id} className="cursor-pointer">
                        {g.name} ({g._count?.memberships || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tag</Label>
                <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v === 'all' ? '' : v); setPage(1) }}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Tags</SelectItem>
                    {tags.map((t: any) => (
                      <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                          {t.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {statusFilter && (
            <Badge variant="secondary" className="gap-1 cursor-default">
              Status: {statusFilter}
              <button onClick={() => { setStatusFilter(''); setPage(1) }} className="cursor-pointer hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {groupFilter && (
            <Badge variant="secondary" className="gap-1 cursor-default">
              Group: {groups.find((g: any) => g.id === groupFilter)?.name}
              <button onClick={() => { setGroupFilter(''); setPage(1) }} className="cursor-pointer hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {tagFilter && (
            <Badge variant="secondary" className="gap-1 cursor-default">
              Tag: {tags.find((t: any) => t.id === tagFilter)?.name}
              <button onClick={() => { setTagFilter(''); setPage(1) }} className="cursor-pointer hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs cursor-pointer">
            Clear all
          </Button>
        </div>
      )}

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button onClick={() => handleSort('firstName')} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Member <SortIcon field="firstName" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Contact <SortIcon field="email" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Status <SortIcon field="status" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Groups</TableHead>
                  <TableHead className="hidden lg:table-cell">Tags</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member: any) => {
                    const visibleGroups = member.memberships?.slice(0, 2) || []
                    const overflowGroups = member.memberships?.slice(2) || []
                    const visibleTags = member.tags?.slice(0, 2) || []
                    const overflowTags = member.tags?.slice(2) || []

                    return (
                      <TableRow
                        key={member.id}
                        className="cursor-pointer group"
                        onClick={() => openEditDialog(member)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.photo} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                {member.firstName[0]}{member.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            {member.email && <p className="truncate max-w-[200px]">{member.email}</p>}
                            {member.phone && <p className="text-muted-foreground text-xs">{member.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={statusColor(member.status)}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot(member.status)} mr-1`} />
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {visibleGroups.map((m: any) => (
                              <Badge key={m.groupId} variant="outline" className="text-[10px] px-1.5 py-0">
                                {m.group.name}
                              </Badge>
                            ))}
                            {overflowGroups.length > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                +{overflowGroups.length}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {visibleTags.map((t: any) => (
                              <Badge key={t.tagId} variant="outline" className="text-[10px] px-1.5 py-0">
                                <span className="h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: t.tag.color }} />
                                {t.tag.name}
                              </Badge>
                            ))}
                            {overflowTags.length > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                +{overflowTags.length}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 cursor-pointer">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(member) }} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(member) }} className="cursor-pointer text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 20 >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative group/avatar">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                    {formData.firstName ? formData.firstName[0] : ''}{formData.lastName ? formData.lastName[0] : ''}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            {photoPreview && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { document.querySelector<HTMLInputElement>('input[type="file"]')?.click() }} className="cursor-pointer">
                  <Upload className="h-3 w-3 mr-1" />
                  Change
                </Button>
                <Button variant="outline" size="sm" onClick={removePhoto} className="cursor-pointer">
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                  className="cursor-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="cursor-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
                  className="cursor-text"
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                    <SelectItem value="visitor" className="cursor-pointer">Visitor</SelectItem>
                    <SelectItem value="inactive" className="cursor-pointer">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                className="cursor-text"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Groups</Label>
              <div className="flex flex-wrap gap-1.5">
                {groups.map((g: any) => (
                  <Badge
                    key={g.id}
                    variant={selectedGroupIds.includes(g.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleGroup(g.id)}
                  >
                    {g.name}
                  </Badge>
                ))}
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
              {editingMember ? 'Save Changes' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

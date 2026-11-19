'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  CheckCircle2, XCircle, Clock, Loader2, ClipboardCheck, Music, Video
} from 'lucide-react'
import { toast } from 'sonner'

interface SubmissionsPageProps {
  pendingCount?: number
}

export default function SubmissionsPage({ pendingCount }: SubmissionsPageProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved')
  const [processing, setProcessing] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions')
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch {
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const openReviewDialog = (submission: any, action: 'approved' | 'rejected') => {
    setCurrentSubmission(submission)
    setReviewNotes('')
    setReviewAction(action)
    setReviewDialogOpen(true)
  }

  const handleReview = async () => {
    if (!currentSubmission) return

    setProcessing(true)
    try {
      const res = await fetch(`/api/submissions/${currentSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewAction, notes: reviewNotes }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to review submission')
        return
      }

      toast.success(`Submission ${reviewAction === 'approved' ? 'approved' : 'rejected'}`)
      setReviewDialogOpen(false)
      fetchSubmissions()
    } catch {
      toast.error('Failed to review submission')
    } finally {
      setProcessing(false)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-rose-500" />
      default: return null
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'approved': return 'bg-emerald-100 text-emerald-700'
      case 'rejected': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const pendingSubmissions = submissions.filter((s: any) => s.status === 'pending')
  const reviewedSubmissions = submissions.filter((s: any) => s.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">Review and manage media submissions</p>
      </div>

      {/* Pending Submissions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Pending Review</h2>
          {pendingSubmissions.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700">{pendingSubmissions.length}</Badge>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pendingSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>All submissions reviewed!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingSubmissions.map((sub: any) => (
              <Card key={sub.id} className="border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="rounded-lg bg-amber-50 p-2 shrink-0">
                        {sub.mediaItem?.type === 'audio' ? (
                          <Music className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Video className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{sub.mediaItem?.title || 'Untitled'}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[8px]">
                              {sub.member?.firstName?.[0]}{sub.member?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {sub.member?.firstName} {sub.member?.lastName}
                          </span>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusColor(sub.status)}`}>
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {sub.notes && (
                    <p className="text-sm text-muted-foreground mb-3 italic">&ldquo;{sub.notes}&rdquo;</p>
                  )}
                  <div className="text-xs text-muted-foreground mb-3">
                    Submitted {new Date(sub.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openReviewDialog(sub, 'approved')}
                      className="flex-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewDialog(sub, 'rejected')}
                      className="flex-1 cursor-pointer text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed Submissions */}
      {reviewedSubmissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recently Reviewed</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviewedSubmissions.map((sub: any) => (
              <Card key={sub.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      {sub.mediaItem?.type === 'audio' ? (
                        <Music className="h-5 w-5 text-violet-500" />
                      ) : (
                        <Video className="h-5 w-5 text-rose-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{sub.mediaItem?.title || 'Untitled'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {sub.member?.firstName} {sub.member?.lastName}
                        </span>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusColor(sub.status)}`}>
                          {statusIcon(sub.status)}
                          <span className="ml-1">{sub.status}</span>
                        </Badge>
                      </div>
                      {sub.reviewer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviewed by {sub.reviewer.name}
                          {sub.reviewedAt && ` on ${new Date(sub.reviewedAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'Approve' : 'Reject'} Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to {reviewAction === 'approved' ? 'approve' : 'reject'} &ldquo;{currentSubmission?.mediaItem?.title}&rdquo;?
            </p>
            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any review notes..."
                className="cursor-text"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button
              onClick={handleReview}
              disabled={processing}
              variant={reviewAction === 'rejected' ? 'destructive' : 'default'}
              className="cursor-pointer"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {reviewAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

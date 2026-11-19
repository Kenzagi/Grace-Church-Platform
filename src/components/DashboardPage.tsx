'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Disc3, Calendar, ClipboardCheck, TrendingUp } from 'lucide-react'

interface DashboardPageProps {
  data: any
}

export default function DashboardPage({ data }: DashboardPageProps) {
  if (!data) return null

  const { stats, recentMembers, upcomingEvents, recentMedia } = data

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Media Items',
      value: stats.totalMedia,
      icon: Disc3,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingSubmissions,
      icon: ClipboardCheck,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ]

  const engagementPercent = stats.totalMembers > 0
    ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
    : 0

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'visitor': return 'bg-blue-100 text-blue-700'
      case 'inactive': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'audio': return '🎵'
      case 'video': return '🎬'
      default: return '📄'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your church.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Engagement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Member Engagement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Active Members</span>
              <span className="font-medium">{stats.activeMembers} of {stats.totalMembers} ({engagementPercent}%)</span>
            </div>
            <Progress value={engagementPercent} className="h-3" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active: {stats.activeMembers}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Visitor: {stats.visitorMembers}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                Inactive: {stats.totalMembers - stats.activeMembers - stats.visitorMembers}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMembers?.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email || member.phone || 'No contact'}</p>
                  </div>
                  <Badge variant="secondary" className={statusColor(member.status)}>
                    {member.status}
                  </Badge>
                </div>
              ))}
              {(!recentMembers || recentMembers.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents?.map((event: any) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700 min-w-[48px]">
                    <span className="text-xs font-medium">
                      {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      {new Date(event.startTime).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Media */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentMedia?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="text-2xl">{typeIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} {item.speaker && `· ${item.speaker.firstName} ${item.speaker.lastName}`}
                  </p>
                  {item.series && (
                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                      {item.series.name}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {(!recentMedia || recentMedia.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">No media items yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

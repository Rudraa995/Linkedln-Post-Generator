'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Filter, Edit2, Copy, Download, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPosts, deletePost, duplicatePost, updatePost } from '@/lib/storage'
import { type PostStatus, type PostType } from '@/types'
import { formatDate } from '@/lib/utils'

const POST_TYPE_LABELS: Record<PostType, string> = {
 'project-announcement': 'Project Announcement',
 'achievement': 'Achievement',
 'learning-experience': 'Learning Experience',
 'internship-experience': 'Internship Experience',
 'job-update': 'Job Update',
 'technical-knowledge': 'Technical Knowledge',
 'personal-story': 'Personal Story',
 'industry-insights': 'Industry Insights',
 'career-advice': 'Career Advice',
 'product-launch': 'Product Launch',
}

export default function HistoryPage() {
 const [posts, setPosts] = useState<any[]>([])
 const [search, setSearch] = useState('')
 const [typeFilter, setTypeFilter] = useState<string>('all')
 const [statusFilter, setStatusFilter] = useState<string>('all')
 const [dateFilter, setDateFilter] = useState<string>('')

 useEffect(() => {
 setPosts(getPosts())
 }, [])

 const filteredPosts = useMemo(() => {
 return posts.filter((p) => {
 const matchesSearch = p.topic
 .toLowerCase()
 .includes(search.toLowerCase())
 const matchesType = typeFilter === 'all' || p.postType === typeFilter
 const matchesStatus =
 statusFilter === 'all' || p.status === statusFilter
 const matchesDate =
 !dateFilter || new Date(p.updatedAt).toISOString().split('T')[0] === dateFilter
 return matchesSearch && matchesType && matchesStatus && matchesDate
 })
 }, [posts, search, typeFilter, statusFilter, dateFilter])

 const handleDelete = useCallback((id: string) => {
 if (!window.confirm('Delete this post?')) return
 deletePost(id)
 setPosts(getPosts())
 }, [])

 const handleDuplicate = useCallback((id: string) => {
 duplicatePost(id)
 setPosts(getPosts())
 }, [])

 const handleStatusChange = useCallback((id: string, status: PostStatus) => {
 updatePost(id, { status })
 setPosts(getPosts())
 }, [])

 return (
 <div className="space-y-4">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <h1 className="text-2xl font-semibold tracking-tight">Post History</h1>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPosts(getPosts())}
 >
 <Clock className="w-4 h-4" /> Refresh
 </Button>
 </div>
 </div>

 {/* Filters */}
 <Card>
 <CardContent className="p-5">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="relative flex-1">
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
 <Search className="w-4 h-4" />
 </div>
 <Input
 placeholder="Search by topic..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-10"
 />
 </div>
 <div className="flex-1">
 <label className="text-xs font-medium text-muted-foreground block mb-1">
 Post Type
 </label>
 <select
 value={typeFilter}
 onChange={(e) => setTypeFilter(e.target.value)}
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="all">All Types</option>
 {Object.entries(POST_TYPE_LABELS).map(([key, label]) => (
 <option key={key} value={key}>
 {label}
 </option>
 ))}
 </select>
 </div>
 <div className="flex-1">
 <label className="text-xs font-medium text-muted-foreground block mb-1">
 Status
 </label>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="all">All Statuses</option>
 <option value="draft">Draft</option>
 <option value="planned">Planned</option>
 <option value="scheduled">Scheduled</option>
 <option value="published">Published</option>
 </select>
 </div>
 <div className="flex-1">
 <label className="text-xs font-medium text-muted-foreground block mb-1">
 Date
 </label>
 <input
 type="date"
 value={dateFilter}
 onChange={(e) => setDateFilter(e.target.value)}
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
 />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Posts List */}
 <Card>
 <CardHeader>
 <CardTitle>Generated Posts</CardTitle>
 </CardHeader>
 <CardContent>
 {filteredPosts.length === 0 ? (
 <div className="text-center py-12">
 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
 <Search className="w-8 h-8 text-muted-foreground" />
 </div>
 <p className="text-muted-foreground">No posts found matching your filters.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredPosts.map((post) => (
 <PostRow
 key={post.id}
 post={post}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 onStatusChange={handleStatusChange}
 />
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 )
}

function PostRow({
 post,
 onDelete,
 onDuplicate,
 onStatusChange,
}: {
 post: any
 onDelete: (id: string) => void
 onDuplicate: (id: string) => void
 onStatusChange: (id: string, status: PostStatus) => void
}) {
 const [editing, setEditing] = useState(false)
 const [content, setContent] = useState(post.content || '')

 const statusColors: Record<PostStatus, string> = {
 draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
 planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
 scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
 published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
 }

 return (
 <div className="border border-border/50 rounded-lg p-4 hover:shadow-md ">
 {editing ? (
 <div className="space-y-3">
 <Textarea
 value={content}
 onChange={(e) => setContent(e.target.value)}
 rows={4}
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
 />
 <div className="flex gap-2">
 <select
 value={post.status}
 onChange={(e) =>
 onStatusChange(post.id, e.target.value as PostStatus)
 }
 className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="draft">Draft</option>
 <option value="planned">Planned</option>
 <option value="scheduled">Scheduled</option>
 <option value="published">Published</option>
 </select>
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 // Save content
 fetch(`/api/posts/${post.id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ content, status: post.status }),
 }).then(() => {
 setEditing(false)
 })
 }}
 >
 Save
 </Button>
 <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
 Cancel
 </Button>
 </div>
 </div>
 ) : (
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
 <Clock className="w-5 h-5 text-muted-foreground" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-foreground truncate">
 {post.topic}
 </p>
 <p className="text-xs text-muted-foreground truncate">
 {post.content?.slice(0, 120)}...
 </p>
 <div className="mt-2 flex flex-wrap gap-2">
 <Badge variant="outline" className="text-xs">
 {POST_TYPE_LABELS[post.postType as PostType] || post.postType}
 </Badge>
 <span className="text-xs text-muted-foreground">
 {formatDate(post.updatedAt)}
 </span>
 </div>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge
 variant={post.status === 'published' ? 'success' : 'secondary'}
 className="text-xs"
 >
 {post.status}
 </Badge>
 <div className="flex gap-1">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setEditing(true)}
 >
 <Edit2 className="w-3 h-3" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onDuplicate(post.id)}
 >
 <Copy className="w-3 h-3" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onDelete(post.id)}
 >
 <Trash2 className="w-3 h-3" />
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}

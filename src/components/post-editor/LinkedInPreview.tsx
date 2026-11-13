'use client'

import { Image as ImageIcon } from 'lucide-react'

interface LinkedInPreviewProps {
 name: string
 headline: string
 content: string
 hashtags: string[]
 imageUrl?: string
}

export default function LinkedInPreview({
 name,
 headline,
 content,
 hashtags,
 imageUrl,
}: LinkedInPreviewProps) {
 return (
 <div className="bg-white dark:bg-[#0a192f] rounded-xl border border-[#e1e4e8] dark:border-[#1d2b3d] p-5 max-w-md shadow-sm">
 {/* Header */}
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 rounded-full bg-[#e1e4e8] dark:bg-[#1d2b3d] flex items-center justify-center text-xs font-semibold text-#0a66c2">
 {name.charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="text-sm font-semibold text-#0a192f dark:text-#ffffff">
 {name}
 </div>
 <div className="text-[11px] text-[#5f6368] dark:text-#8b949e">
 {headline} • 1h
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="text-sm text-#0a192f dark:text-#ffffff leading-relaxed mb-3 whitespace-pre-wrap break-words">
 {content}
 </div>

 {/* Hashtags */}
 {hashtags.length > 0 && (
 <div className="flex flex-wrap gap-1 mb-3">
 {hashtags.map((tag) => (
 <span
 key={tag}
 className="text-xs text-#0a66c2 hover:underline cursor-pointer"
 >
 #{tag}
 </span>
 ))}
 </div>
 )}

 {/* Attached Image */}
 {imageUrl && (
 <div className="h-48 rounded-lg bg-[#e1e4e8] dark:bg-[#1d2b3d] border border-[#e1e4e8] dark:border-[#1d2b3d] flex items-center justify-center overflow-hidden">
 <img
 src={imageUrl}
 alt="Post image"
 className="w-full h-full object-cover"
 />
 </div>
 )}
 </div>
 )
}

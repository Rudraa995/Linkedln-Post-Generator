export const metadata = {
 title: 'Settings',
}

export default function SettingsPage() {
 return (
 <div className="space-y-4">
 <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
 <p className="text-muted-foreground">
 Configure your default preferences for post generation.
 </p>

 <div className="bg-card rounded-lg border border-input p-6 shadow-sm max-w-lg">
 <h2 className="text-lg font-semibold mb-6">Default Preferences</h2>
 <form className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Default Language</label>
 <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
 <option>English</option>
 <option>Hindi</option>
 <option>Gujarati</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Default Tone</label>
 <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
 <option>Professional</option>
 <option>Friendly</option>
 <option>Storytelling</option>
 <option>Inspirational</option>
 <option>Technical</option>
 <option>Humorous</option>
 <option>Conversational</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Default Post Length</label>
 <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
 <option>Short</option>
 <option>Medium</option>
 <option>Long</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Default Emoji Preference</label>
 <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
 <option>No Emojis</option>
 <option>Minimal Emojis</option>
 <option>Creative Emojis</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="flex items-center gap-2 cursor-pointer select-none">
 <input
 type="checkbox"
 checked
 className="rounded border-input bg-background text-primary focus:ring-0 peer"
 />
 <span className="text-sm text-foreground">Enable Hashtags by Default</span>
 </label>
 </div>

 <button
 className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-primary/90 "
 >
 Save Settings
 </button>
 </form>
 </div>
 </div>
 )
}

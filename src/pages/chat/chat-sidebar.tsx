// "use client"

// import { useState } from "react"
// import { Search, X } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Sheet, SheetContent } from "@/components/ui/sheet"
// import { cn } from "@/lib/utils"
// import type { User, Conversation } from "@/types/chat"
// import { formatDistanceToNow } from "@/lib/utils"

// interface ChatSidebarProps {
//   open: boolean
//   setOpen: (open: boolean) => void
//   conversations: Conversation[]
//   currentUser: User
//   onSelectConversation: (conversation: Conversation) => void
//   selectedConversationId?: string
// }

// export function ChatSidebar({
//   open,
//   setOpen,
//   conversations,
//   currentUser,
//   onSelectConversation,
//   selectedConversationId,
// }: ChatSidebarProps) {
//   const [searchQuery, setSearchQuery] = useState("")

//   const filteredConversations = conversations.filter((conversation) => {
//     const otherUser = conversation.participants.find((participant) => participant.id !== currentUser.id)
//     return (
//       otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   })

//   const sidebarContent = (
//     <div className="flex h-full flex-col">
//       <div className="p-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-bold">Chats</h2>
//           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(false)}>
//             <X className="h-5 w-5" />
//             <span className="sr-only">Close sidebar</span>
//           </Button>
//         </div>
//         <div className="relative mt-4">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             type="search"
//             placeholder="Search conversations..."
//             className="pl-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>
//       <ScrollArea className="flex-1 px-2">
//         <div className="space-y-2 py-2">
//           {filteredConversations.map((conversation) => {
//             const otherUser = conversation.participants.find((participant) => participant.id !== currentUser.id)
//             if (!otherUser) return null

//             return (
//               <button
//                 key={conversation.id}
//                 className={cn(
//                   "flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-all hover:bg-accent",
//                   selectedConversationId === conversation.id && "bg-accent",
//                 )}
//                 onClick={() => {
//                   onSelectConversation(conversation)
//                   if (window.innerWidth < 768) {
//                     setOpen(false)
//                   }
//                 }}
//               >
//                 <div className="relative">
//                   <Avatar>
//                     <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
//                     <AvatarFallback>
//                       {otherUser.name
//                         .split(" ")
//                         .map((n) => n[0])
//                         .join("")}
//                     </AvatarFallback>
//                   </Avatar>
//                   {otherUser.isOnline && (
//                     <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
//                   )}
//                 </div>
//                 <div className="flex-1 overflow-hidden">
//                   <div className="flex items-center justify-between">
//                     <p className="truncate font-medium">{otherUser.name}</p>
//                     {conversation.lastMessage && (
//                       <p className="text-xs text-muted-foreground">
//                         {formatDistanceToNow(new Date(conversation.lastMessage.timestamp))}
//                       </p>
//                     )}
//                   </div>
//                   {conversation.lastMessage && (
//                     <p className="truncate text-sm text-muted-foreground">
//                       {conversation.lastMessage.senderId === currentUser.id
//                         ? `You: ${conversation.lastMessage.content}`
//                         : conversation.lastMessage.content}
//                     </p>
//                   )}
//                 </div>
//               </button>
//             )
//           })}
//         </div>
//       </ScrollArea>
//       <div className="border-t p-4">
//         <div className="flex items-center gap-3">
//           <Avatar>
//             <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
//             <AvatarFallback>
//               {currentUser.name
//                 .split(" ")
//                 .map((n) => n[0])
//                 .join("")}
//             </AvatarFallback>
//           </Avatar>
//           <div className="flex-1">
//             <p className="font-medium">{currentUser.name}</p>
//             <p className="text-xs text-muted-foreground">Online</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )

//   return (
//     <>
//       <aside className={cn("hidden w-80 shrink-0 border-r bg-background md:block", !open && "md:hidden")}>
//         {sidebarContent}
//       </aside>

//       <Sheet open={open && window.innerWidth < 768} onOpenChange={setOpen}>
//         <SheetContent side="left" className="w-80 p-0 sm:max-w-xs">
//           {sidebarContent}
//         </SheetContent>
//       </Sheet>
//     </>
//   )
// }

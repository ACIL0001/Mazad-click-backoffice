// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Menu } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { MessageBubble } from "@/components/chat/message-bubble"
// import type { User, Conversation, Message } from "@/types/chat"
// import { ChatInput } from "@/components/chat/chat-input"

// interface ChatWindowProps {
//   conversation: Conversation | null
//   currentUser: User
//   onToggleSidebar: () => void
//   isMobileView: boolean
//   sidebarOpen: boolean
// }

// export function ChatWindow({ conversation, currentUser, onToggleSidebar, isMobileView, sidebarOpen }: ChatWindowProps) {
//   const [newMessage, setNewMessage] = useState("")
//   const [messages, setMessages] = useState<Message[]>([])
//   const scrollAreaRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (conversation) {
//       setMessages(conversation.messages)
//     } else {
//       setMessages([])
//     }
//   }, [conversation])

//   useEffect(() => {
//     // Scroll to bottom when messages change
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight
//       }
//     }
//   }, [messages])

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !conversation) return

//     const newMsg: Message = {
//       id: `msg-${Date.now()}`,
//       conversationId: conversation.id,
//       senderId: currentUser.id,
//       content: newMessage,
//       timestamp: new Date().toISOString(),
//       status: "sent",
//     }

//     setMessages([...messages, newMsg])
//     setNewMessage("")
//   }

//   const otherUser = conversation?.participants.find((participant) => participant.id !== currentUser.id)

//   if (!conversation) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <div className="text-center">
//           <h3 className="text-lg font-medium">No conversation selected</h3>
//           <p className="text-muted-foreground">Select a conversation from the sidebar to start chatting</p>
//           {isMobileView && !sidebarOpen && (
//             <Button onClick={onToggleSidebar} className="mt-4">
//               Open Conversations
//             </Button>
//           )}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-full flex-col">
//       <div className="flex items-center border-b px-4 py-3">
//         {isMobileView && !sidebarOpen && (
//           <Button variant="ghost" size="icon" className="mr-2" onClick={onToggleSidebar}>
//             <Menu className="h-5 w-5" />
//             <span className="sr-only">Toggle sidebar</span>
//           </Button>
//         )}
//         {otherUser && (
//           <>
//             <Avatar className="h-9 w-9">
//               <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
//               <AvatarFallback>
//                 {otherUser.name
//                   .split(" ")
//                   .map((n) => n[0])
//                   .join("")}
//               </AvatarFallback>
//             </Avatar>
//             <div className="ml-3">
//               <div className="font-medium">{otherUser.name}</div>
//               <div className="text-xs text-muted-foreground">{otherUser.isOnline ? "Online" : "Offline"}</div>
//             </div>
//           </>
//         )}
//       </div>

//       <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <MessageBubble
//               key={message.id}
//               message={message}
//               isCurrentUser={message.senderId === currentUser.id}
//               user={message.senderId === currentUser.id ? currentUser : otherUser || { id: "", name: "", avatar: "" }}
//             />
//           ))}
//         </div>
//       </ScrollArea>

//       <div className="border-t p-4">
//         <ChatInput
//           onSendMessage={(message) => {
//             if (!conversation) return

//             const newMsg: Message = {
//               id: `msg-${Date.now()}`,
//               conversationId: conversation.id,
//               senderId: currentUser.id,
//               content: message,
//               timestamp: new Date().toISOString(),
//               status: "sent",
//             }

//             setMessages([...messages, newMsg])
//           }}
//           disabled={!conversation}
//         />
//       </div>
//     </div>
//   )
// }

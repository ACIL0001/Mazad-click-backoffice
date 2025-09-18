// "use client"

// import { useState, useEffect } from "react"
// import { ChatSidebar } from "@/components/chat/chat-sidebar"
// import { ChatWindow } from "@/components/chat/chat-window"
// import { ModeToggle } from "@/components/mode-toggle"
// import { useMobile } from "@/hooks/use-mobile"
// import type { User, Conversation } from "@/types/chat"
// import { mockUsers, mockConversations } from "@/lib/mock-data"

// export function ChatLayout() {
//   const isMobile = useMobile()
//   const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
//   const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0] || null)
//   const [currentUser, setCurrentUser] = useState<User>(mockUsers[0])

//   useEffect(() => {
//     setSidebarOpen(!isMobile)
//   }, [isMobile])

//   return (
//     <div className="flex h-screen w-full overflow-hidden bg-background">
//       <ChatSidebar
//         open={sidebarOpen}
//         setOpen={setSidebarOpen}
//         conversations={mockConversations}
//         currentUser={currentUser}
//         onSelectConversation={setSelectedConversation}
//         selectedConversationId={selectedConversation?.id}
//       />
//       <div className="relative flex flex-1 flex-col">
//         <div className="absolute right-4 top-4 z-10">
//           <ModeToggle />
//         </div>
//         <ChatWindow
//           conversation={selectedConversation}
//           currentUser={currentUser}
//           onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
//           isMobileView={isMobile}
//           sidebarOpen={sidebarOpen}
//         />
//       </div>
//     </div>
//   )
// }

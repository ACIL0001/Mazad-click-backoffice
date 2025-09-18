// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { cn } from "@/lib/utils"
// import type { Message, User } from "@/types/chat"
// import { formatTime } from "@/lib/utils"

// interface MessageBubbleProps {
//   message: Message
//   isCurrentUser: boolean
//   user: User
// }

// export function MessageBubble({ message, isCurrentUser, user }: MessageBubbleProps) {
//   return (
//     <div className={cn("flex items-end gap-2", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
//       {!isCurrentUser && (
//         <Avatar className="h-8 w-8">
//           <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
//           <AvatarFallback>
//             {user.name
//               .split(" ")
//               .map((n) => n[0])
//               .join("")}
//           </AvatarFallback>
//         </Avatar>
//       )}
//       <div
//         className={cn(
//           "max-w-[75%] rounded-lg px-4 py-2",
//           isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
//         )}
//       >
//         <p className="text-sm">{message.content}</p>
//         <div
//           className={cn(
//             "mt-1 text-right text-xs opacity-70",
//             isCurrentUser ? "text-primary-foreground" : "text-muted-foreground",
//           )}
//         >
//           {formatTime(new Date(message.timestamp))}
//         </div>
//       </div>
//     </div>
//   )
// }

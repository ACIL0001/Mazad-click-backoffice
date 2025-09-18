// "use client"

// import { useState, useRef } from "react"
// import { Paperclip, Smile, ImageIcon, Mic, Send } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"

// interface ChatInputProps {
//   onSendMessage: (message: string) => void
//   disabled?: boolean
// }

// export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
//   const [message, setMessage] = useState("")
//   const inputRef = useRef<HTMLInputElement>(null)

//   const handleSend = () => {
//     if (message.trim() && !disabled) {
//       onSendMessage(message)
//       setMessage("")
//       inputRef.current?.focus()
//     }
//   }

//   return (
//     <div className="border-t bg-background p-3">
//       <div className="flex items-center rounded-full border bg-background px-3 py-2">
//         <Button
//           type="button"
//           size="icon"
//           variant="ghost"
//           className="h-8 w-8 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground"
//         >
//           <Paperclip className="h-5 w-5" />
//           <span className="sr-only">Add attachment</span>
//         </Button>

//         <input
//           ref={inputRef}
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 border-0 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0"
//           onKeyDown={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault()
//               handleSend()
//             }
//           }}
//           disabled={disabled}
//         />

//         <div className="flex items-center gap-1">
//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground"
//           >
//             <Smile className="h-5 w-5" />
//             <span className="sr-only">Add emoji</span>
//           </Button>

//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground"
//           >
//             <ImageIcon className="h-5 w-5" />
//             <span className="sr-only">Add image</span>
//           </Button>

//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground"
//           >
//             <Mic className="h-5 w-5" />
//             <span className="sr-only">Voice message</span>
//           </Button>

//           <Button
//             type="button"
//             size="icon"
//             onClick={handleSend}
//             disabled={!message.trim() || disabled}
//             className={cn(
//               "ml-1 h-10 w-10 rounded-full",
//               message.trim() && !disabled
//                 ? "bg-primary text-primary-foreground hover:bg-primary/90"
//                 : "bg-muted text-muted-foreground",
//             )}
//           >
//             <Send className="h-5 w-5" />
//             <span className="sr-only">Send message</span>
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

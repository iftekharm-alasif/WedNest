import { LoaderCircle } from "lucide-react"

const Loading = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <LoaderCircle size={38} className="animate-spin text-[#A65D55]" />

      <p className="text-sm font-medium text-[#777]">Loading, please wait...</p>
    </div>
  )
}

export default Loading

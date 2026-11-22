"use client"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  ImagePlus,
  MapPin,
  Tag,
  X,
  LoaderCircle,
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  createServices,
  uploadServiceImages,
  uploadImageFromUrl,
} from "@/lib/actions/services"

const categories = [
  "Photography",
  "Videography",
  "Catering",
  "Wedding Venue",
  "Decoration",
  "Makeup Artist",
  "Wedding Planner",
  "Music & Entertainment",
  "Wedding Attire",
  "Transportation",
  "Other",
]

const AddServicePage = () => {
  const { data: session } = authClient.useSession()
  const [serviceName, setServiceName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error("You can upload maximum 5 images")
      e.target.value = ""
      return
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024
    )

    if (invalidFile) {
      toast.error("Each image must be an image file under 5 MB")
      e.target.value = ""
      return
    }

    try {
      setUploadingImages(true)

      const result = await uploadServiceImages(files)

      if (result.success) {
        setImages((prev) => [...prev, ...result.images])
        toast.success("Images uploaded successfully")
      } else {
        toast.error(result.message || "Image upload failed")
      }
    } catch {
      toast.error("Failed to upload images")
    } finally {
      setUploadingImages(false)
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }
  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL")
      return
    }

    if (images.length >= 5) {
      toast.error("You can upload maximum 5 images")
      return
    }

    try {
      setUploadingImages(true)

      const result = await uploadImageFromUrl(imageUrl)

      if (result.success) {
        setImages((prev) => [...prev, result.image])
        setImageUrl("")
        toast.success("Image uploaded to ImgBB")
      } else {
        toast.error(result.message || "Image upload failed")
      }
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const confirmSubmit = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image")
      setShowConfirmation(false)
      return
    }

    try {
      setLoading(true)

      const serviceData = {
        serviceName,
        category,
        description,
        price,
        location,
        images,
        vendorId: session?.user.id,
        vendorName: session?.user.name,
        vendorEmail: session?.user.email,
      }

      const result = await createServices(serviceData)

      if (result.success) {
        toast.success("Service submitted successfully!")
        setImageUrl("")
        setServiceName("")
        setCategory("")
        setDescription("")
        setPrice("")
        setLocation("")
        setImages([])
      } else {
        toast.error(result.message || "Failed to submit service")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setShowConfirmation(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/vendor/services"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#A65D55]"
        >
          <ArrowLeft size={17} />
          Back to My Services
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Add New Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Share your wedding service with customers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm md:p-8"
        >
          {/* Service Information */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <BriefcaseBusiness size={19} className="text-[#A65D55]" />
              <h2 className="font-semibold text-gray-900">
                Service Information
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Enter service name"
                  className="h-12 w-full rounded-xl border border-[#E8D5D0] px-4 text-sm transition outline-none focus:border-[#A65D55]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E8D5D0] bg-white px-4 text-sm transition outline-none focus:border-[#A65D55]"
                >
                  <option value="">Select a category</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price
                </label>
                <div className="relative">
                  <Tag
                    size={17}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter your price"
                    className="h-12 w-full rounded-xl border border-[#E8D5D0] pr-4 pl-11 text-sm transition outline-none focus:border-[#A65D55]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    className="h-12 w-full rounded-xl border border-[#E8D5D0] pr-4 pl-11 text-sm transition outline-none focus:border-[#A65D55]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service..."
                className="w-full resize-none rounded-xl border border-[#E8D5D0] p-4 text-sm transition outline-none focus:border-[#A65D55]"
              />
            </div>
          </div>

          <div className="border-t border-[#F0E5E1]" />

          {/* Images */}
          <div>
            <div className="mb-5">
              <h2 className="font-semibold text-gray-900">Service Images</h2>
              <p className="mt-1 text-xs text-gray-500">
                Upload images to showcase your service.
              </p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-[#E8D5D0] bg-[#FDF9F7] p-6 text-center">
              <ImagePlus size={35} className="mx-auto mb-3 text-[#A65D55]" />

              <h3 className="text-sm font-semibold text-gray-800">
                Upload Service Images
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Select up to 5 images. Maximum 5 MB each.
              </p>

              <label className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#A65D55] px-5 text-sm font-semibold text-white transition hover:bg-[#884840]">
                {uploadingImages ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus size={17} />
                    Choose Images
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingImages || images.length >= 5}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Or Paste Image URL
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 flex-1 rounded-xl border border-[#E8D5D0] px-4 text-sm outline-none focus:border-[#A65D55]"
                />

                <button
                  type="button"
                  onClick={handleUrlUpload}
                  disabled={uploadingImages || images.length >= 5}
                  className="h-12 rounded-xl bg-[#A65D55] px-6 text-sm font-semibold text-white transition hover:bg-[#884840] disabled:opacity-60"
                >
                  {uploadingImages ? "Uploading..." : "Add Image"}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Paste a public image URL. It will be uploaded to ImgBB.
              </p>
            </div>
            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative h-28 overflow-hidden rounded-xl border border-[#F0E5E1]"
                  >
                    <img
                      src={image}
                      alt={`Service image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-white p-1.5 text-red-500 shadow transition hover:bg-red-50"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-gray-500">
              {images.length}/5 images uploaded
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end border-t border-[#F0E5E1] pt-6">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#884840] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Service"
              )}
            </button>
          </div>
        </form>
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Your Service?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit this service? It will be sent to
                the admin for approval before appearing in Browse Services.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  confirmSubmit()
                }}
                disabled={loading}
                className="bg-[#A65D55] hover:bg-[#884840]"
              >
                {loading ? "Submitting..." : "Yes, Submit"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default AddServicePage

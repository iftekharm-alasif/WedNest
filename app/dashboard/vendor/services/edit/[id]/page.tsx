
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  getServiceById,
  updateService,
  uploadServiceImages,
  uploadImageFromUrl,
} from "@/lib/actions/services";
import { toast } from "sonner";
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Tag,
  X,
  BriefcaseBusiness,
} from "lucide-react";

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
];

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = authClient.useSession();

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        const result = await getServiceById(id);

        if (!session?.user?.id) return;

        if (result.vendorId !== session.user.id) {
          toast.error("You cannot edit this service");
          router.replace("/dashboard/vendor/services");
          return;
        }

        setServiceName(result.serviceName || "");
        setCategory(result.category || "");
        setDescription(result.description || "");
        setPrice(String(result.price || ""));
        setLocation(result.location || "");
        setImages(result.images || []);
        setThumbnail(result.images?.[0] || "");
      } catch {
        toast.error("Failed to load service");
        router.replace("/dashboard/vendor/services");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      loadService();
    }
  }, [id, session?.user?.id, router]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error("You can upload maximum 5 images");
      e.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !file.type.startsWith("image/") ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      toast.error("Each image must be an image file under 5 MB");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const result = await uploadServiceImages(files);

      if (result.success) {
        setImages((prev) => [...prev, ...result.images]);
        toast.success("Images uploaded successfully");
      } else {
        toast.error(result.message || "Image upload failed");
      }
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    if (images.length >= 5) {
      toast.error("You can upload maximum 5 images");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadImageFromUrl(imageUrl);

      if (result.success) {
        setImages((prev) => [...prev, result.image]);
        setImageUrl("");
        toast.success("Image added successfully");
      } else {
        toast.error(result.message || "Image upload failed");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (image: string) => {
    const updatedImages = images.filter((item) => item !== image);
    setImages(updatedImages);

    if (thumbnail === image) {
      setThumbnail(updatedImages[0] || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("Please sign in again");
      return;
    }

    if (images.length === 0) {
      toast.error("Please keep at least one image");
      return;
    }

    if (!thumbnail || !images.includes(thumbnail)) {
      toast.error("Please select a thumbnail");
      return;
    }

    try {
      setSaving(true);

      const orderedImages = [
        thumbnail,
        ...images.filter((image) => image !== thumbnail),
      ];

      const result = await updateService(id, {
        serviceName,
        category,
        description,
        price,
        location,
        images: orderedImages,
        vendorId: session.user.id,
      });

      if (result.success) {
        toast.success("Service updated successfully");
        router.push("/dashboard/vendor/services");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update service");
      }
} catch (error) {
  console.error("Edit Service Error:", error);

  toast.error(
    error instanceof Error ? error.message : "Something went wrong"
  );
} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5]">
        <LoaderCircle className="animate-spin text-[#A65D55]" size={32} />
      </div>
    );
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
            Edit Service
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Update your service information and images.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-[#F0E5E1] bg-white p-5 shadow-sm md:p-8"
        >
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
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E8D5D0] px-4 text-sm outline-none focus:border-[#A65D55]"
                  placeholder="Enter service name"
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
                  className="h-12 w-full rounded-xl border border-[#E8D5D0] bg-white px-4 text-sm outline-none focus:border-[#A65D55]"
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
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter your price"
                    className="h-12 w-full rounded-xl border border-[#E8D5D0] pr-4 pl-11 text-sm outline-none focus:border-[#A65D55]"
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
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    className="h-12 w-full rounded-xl border border-[#E8D5D0] pr-4 pl-11 text-sm outline-none focus:border-[#A65D55]"
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
                className="w-full resize-none rounded-xl border border-[#E8D5D0] p-4 text-sm outline-none focus:border-[#A65D55]"
              />
            </div>
          </div>

          <div className="border-t border-[#F0E5E1]" />

          <div>
            <h2 className="font-semibold text-gray-900">Service Images</h2>
            <p className="mt-1 text-xs text-gray-500">
              Select one image as your main thumbnail. Maximum 5 images.
            </p>

            <div className="mt-5 rounded-xl border-2 border-dashed border-[#E8D5D0] bg-[#FDF9F7] p-6 text-center">
              <ImagePlus
                size={35}
                className="mx-auto mb-3 text-[#A65D55]"
              />
              <h3 className="text-sm font-semibold text-gray-800">
                Upload Service Images
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Maximum 5 MB each.
              </p>

              <label className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#A65D55] px-5 text-sm font-semibold text-white hover:bg-[#884840]">
                {uploading ? (
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
                  disabled={uploading || images.length >= 5}
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
                  disabled={uploading || images.length >= 5}
                  className="h-12 rounded-xl bg-[#A65D55] px-6 text-sm font-semibold text-white hover:bg-[#884840] disabled:opacity-60"
                >
                  Add Image
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                The image URL will be uploaded to ImgBB.
              </p>
            </div>

            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {images.map((image, index) => (
                  <div key={image} className="space-y-2">
                    <div
                      className={`relative h-28 overflow-hidden rounded-xl border-2 ${
                        thumbnail === image
                          ? "border-[#A65D55]"
                          : "border-[#F0E5E1]"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Service image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="absolute top-2 right-2 rounded-full bg-white p-1.5 text-red-500 shadow hover:bg-red-50"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setThumbnail(image)}
                      className={`w-full rounded-lg px-2 py-2 text-xs font-semibold ${
                        thumbnail === image
                          ? "bg-[#A65D55] text-white"
                          : "border border-[#E8D5D0] text-gray-600 hover:border-[#A65D55]"
                      }`}
                    >
                      {thumbnail === image ? "Selected Thumbnail" : "Set as Thumbnail"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-gray-500">
              {images.length}/5 images uploaded
            </p>
          </div>

          <div className="flex justify-end border-t border-[#F0E5E1] pt-6">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#A65D55] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#884840] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

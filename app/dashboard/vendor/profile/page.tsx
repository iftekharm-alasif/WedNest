
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { uploadServiceImages } from "@/lib/actions/services";
import { toast } from "sonner";
import {
  UserRound,
  Mail,
  Building2,
  ShieldCheck,
  Pencil,
  X,
  Save,
  Camera,
  LoaderCircle,
  Crown,
  CalendarDays,
} from "lucide-react";

export default function VendorProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [savedImage, setSavedImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-[#F0E5E1] bg-white p-8 text-center">
        <p className="text-gray-600">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  const user = session.user as typeof session.user & {
    businessName?: string;
    subscriptionPlan?: string;
    subscriptionExpiresAt?: string | Date;
  };

  const plan = user.subscriptionPlan || "free";
  const profileImage = imagePreview || savedImage || user.image || "";

  const handleEdit = () => {
    setName(user.name || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);

      const { error } = await authClient.updateUser({
        name: name.trim(),
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setImageLoading(true);

      const result = await uploadServiceImages([imageFile]);

      if (!result.success || !result.images?.[0]) {
        toast.error(result.message || "Image upload failed");
        return;
      }

      const imageUrl = result.images[0];

      const { error } = await authClient.updateUser({
        image: imageUrl,
      });

      if (error) {
        toast.error(error.message || "Failed to save profile image");
        return;
      }

      setSavedImage(imageUrl);
      setImageFile(null);
      setImagePreview("");

      await authClient.getSession({
        query: { disableCookieCache: true },
      });

      toast.success("Profile photo saved successfully!");
    } catch (error) {
      console.log("Profile Image Error:", error);
      toast.error("Failed to upload profile image");
    } finally {
      setImageLoading(false);
    }
  };

  const subscriptionDate = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
    : "Not available";
    

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Vendor Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal and business account information.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#F0E5E1] bg-white shadow-sm">
        <div className="bg-[#A65D55] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white text-2xl font-bold text-[#A65D55]">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={user.name || "Vendor"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "V"
                )}
              </div>

              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#A65D55] bg-white text-[#A65D55] transition hover:bg-gray-100">
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0])
                  }
                />
              </label>
            </div>

            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="mt-1 text-sm text-white/80">
                {user.businessName || "WedNest Vendor"}
              </p>
            </div>
          </div>

          {imageFile && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleImageUpload}
                disabled={imageLoading}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#A65D55] transition hover:bg-gray-100 disabled:opacity-60"
              >
                {imageLoading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {imageLoading ? "Saving..." : "Save Profile Photo"}
              </button>

              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                }}
                disabled={imageLoading}
                className="text-sm font-medium text-white hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your account details
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 rounded-lg bg-[#A65D55]/10 px-4 py-2 text-sm font-semibold text-[#A65D55] transition hover:bg-[#A65D55]/20"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#F0E5E1] px-4 text-sm outline-none focus:border-[#A65D55]"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[#A65D55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#884840] disabled:opacity-60"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg border border-[#F0E5E1] px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl bg-[#FAF7F5] p-4">
                <div className="rounded-lg bg-white p-3 text-[#A65D55]">
                  <UserRound size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {user.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-[#FAF7F5] p-4">
                <div className="rounded-lg bg-white p-3 text-[#A65D55]">
                  <Mail size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="mt-1 break-all font-semibold text-gray-800">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-[#FAF7F5] p-4">
                <div className="rounded-lg bg-white p-3 text-[#A65D55]">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Business Name</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {user.businessName || "Not added yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-[#FAF7F5] p-4">
                <div className="rounded-lg bg-white p-3 text-[#A65D55]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Role</p>
                  <p className="mt-1 font-semibold capitalize text-gray-800">
                    Vendor
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#F0E5E1] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#A65D55]/10 p-3 text-[#A65D55]">
            <Crown size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Subscription Details
            </h3>
            <p className="text-sm text-gray-500">
              Your current vendor plan
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-[#FAF7F5] p-4">
            <p className="text-xs text-gray-500">Current Plan</p>
            <p className="mt-2 text-xl font-bold capitalize text-[#A65D55]">
              {plan}
            </p>
          </div>

          <div className="rounded-xl bg-[#FAF7F5] p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDays size={15} />
              <p className="text-xs">Subscription Expiry</p>
            </div>
            <p className="mt-2 font-semibold text-gray-800">
              {subscriptionDate}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Subscription information is displayed from your account data.
        </p>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession, signOut } from "@/lib/auth-client";
import { uploadServiceImages } from "@/lib/actions/services";
import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  LogOut,
  ArrowLeft,
  Camera,
  Save,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const user = session?.user;

  const adminUser = user as
    | (typeof user & {
        role?: string;
        createdAt?: string | Date;
      })
    | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.push("/signin");
      return;
    }

    if (adminUser?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isPending, user, adminUser?.role, router]);

  const handleNameUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);

      const result = await authClient.updateUser({ name });

      if (result.error) {
        toast.error(result.error.message || "Failed to update name");
        return;
      }

      await authClient.getSession({
        query: { disableCookieCache: true },
      });

      toast.success("Name updated successfully");
      setEditing(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(String(reader.result));
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploading(true);

      const result = await uploadServiceImages([selectedImage]);
      const imageUrl = result.images?.[0];

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }

      const updateResult = await authClient.updateUser({
        image: imageUrl,
      });

      if (updateResult.error) {
        toast.error(
          updateResult.error.message || "Failed to save profile picture"
        );
        return;
      }

      await authClient.getSession({
        query: { disableCookieCache: true },
      });

      setSelectedImage(null);
      setPreview("");
      toast.success("Profile picture updated successfully");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/signin");
  };

  if (isPending || !user || adminUser?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const joinedDate = adminUser.createdAt
    ? new Date(adminUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-900"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Admin Profile
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your administrator profile and account information.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-950 to-blue-800 px-6 py-10 text-white md:px-10">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative">
                <div
                  className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white/15 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${preview || user.image || ""}")`,
                  }}
                >
                  {!preview && !user.image && <User size={48} />}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-white p-2 text-blue-900 shadow-md hover:bg-gray-100"
                  title="Change profile picture"
                >
                  <Camera size={18} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">
                  {user.name || "Admin User"}
                </h2>
                <p className="mt-1 text-blue-100">{user.email}</p>

                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm">
                  <ShieldCheck size={16} />
                  Administrator
                </span>
              </div>
            </div>

            {selectedImage && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-100 disabled:opacity-60"
                >
                  <Save size={16} />
                  {uploading ? "Uploading..." : "Save Profile Picture"}
                </button>

                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreview("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm text-white hover:bg-white/25"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50"
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleNameUpdate} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={user.name || ""}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-5 py-3 text-white hover:bg-blue-900 disabled:opacity-60"
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-5">
                  <div className="mb-3 flex items-center gap-3 text-blue-900">
                    <User size={20} />
                    <span className="font-medium">Full Name</span>
                  </div>
                  <p className="break-words text-gray-700">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                  <div className="mb-3 flex items-center gap-3 text-blue-900">
                    <Mail size={20} />
                    <span className="font-medium">Email Address</span>
                  </div>
                  <p className="break-all text-gray-700">{user.email}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    Email cannot be changed here.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                  <div className="mb-3 flex items-center gap-3 text-blue-900">
                    <ShieldCheck size={20} />
                    <span className="font-medium">Account Role</span>
                  </div>
                  <p className="capitalize text-gray-700">
                    {adminUser.role}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                  <div className="mb-3 flex items-center gap-3 text-blue-900">
                    <CalendarDays size={20} />
                    <span className="font-medium">Joined Date</span>
                  </div>
                  <p className="text-gray-700">{joinedDate}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Account Security
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your administrator account information.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

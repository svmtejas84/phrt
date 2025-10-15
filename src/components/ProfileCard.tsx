
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User, Calendar, MapPin, Droplet, UploadCloud } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileDetail {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ProfileCard = () => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("User Name");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/api/profile/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAvatarUrl(data.url); // url returned from backend/cloudinary
    } catch (err) {
      // Silently ignore upload errors
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 bg-card shadow-[var(--shadow-card)] border-border/50 animate-scale-in">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/20">
            <AvatarImage src={avatarUrl} alt="User Name" />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl md:text-3xl font-semibold text-foreground">
              UN
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full w-10 h-10 shadow-md hover:scale-110 transition-transform"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Upload Image"
          >
            {uploading ? <UploadCloud className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          </Button>
          {/* Accessible hidden file input with associated label */}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            aria-label="Upload avatar image"
            title="Upload avatar image"
            onChange={handleImageUpload}
          />
          <label htmlFor="avatar-upload" className="sr-only">Upload avatar image</label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="mt-0.5"><User className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">Full Name</p>
            {editing ? (
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Full Name"
                title="Full Name"
              />
            ) : (
              <p className="text-foreground font-medium">{username}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="mt-0.5"><Calendar className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">Date of Birth</p>
            {editing ? (
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Date of Birth"
                title="Date of Birth"
              />
            ) : (
              <p className="text-foreground font-medium">{dob || "--"}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="mt-0.5"><MapPin className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">Address</p>
            {editing ? (
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Address"
                title="Address"
              />
            ) : (
              <p className="text-foreground font-medium">{address || "--"}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="mt-0.5"><Droplet className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">Blood Group</p>
            {editing ? (
              <input
                type="text"
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Blood Group"
                title="Blood Group"
              />
            ) : (
              <p className="text-foreground font-medium">{bloodGroup || "--"}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 gap-2">
        <Button
          variant="outline"
          onClick={() => setEditing(!editing)}
          disabled={updating}
        >
          {editing ? "Cancel" : "Edit"}
        </Button>
        {editing && (
          <Button
            variant="default"
            onClick={async () => {
              setUpdating(true);
              try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/profile/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ username, dob, address, bloodGroup, avatarUrl }),
                });
                if (!res.ok) throw new Error("Update failed");
                setEditing(false);
              } catch (err) {
                // Silently ignore update errors
              } finally {
                setUpdating(false);
              }
            }}
            disabled={updating}
          >
            {updating ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileCard;

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export type SantriData = {
  id?: string;
  nomorInduk: string;
  nama: string;
  kelas: string;
  divisi: string;
};

const KELAS_OPTIONS = ["X", "XI", "XII"];
const DIVISI_OPTIONS = ["IPA 1", "IPA 2", "IPS 1", "IPS 2", "Bahasa"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initial?: SantriData;
};

export function SantriFormDialog({ open, onClose, onSuccess, initial }: Props) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<SantriData>(
    initial ?? { nomorInduk: "", nama: "", kelas: "", divisi: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof SantriData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      isEdit ? `/api/kas/santri/${initial!.id}` : "/api/kas/santri",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Santri" : "Tambah Santri"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nomor Induk</Label>
            <Input
              value={form.nomorInduk}
              onChange={(e) => set("nomorInduk", e.target.value)}
              placeholder="Nomor induk santri"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="Nama lengkap santri"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={form.kelas} onValueChange={(v) => set("kelas", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {KELAS_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Divisi / Jurusan</Label>
              <Select value={form.divisi} onValueChange={(v) => set("divisi", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih divisi" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISI_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

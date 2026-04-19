"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransaksiPayload = {
  tanggal: string;
  tipe: string;
  nominal: number;
  keterangan: string;
  divisi: string;
  santriId?: string;
};

const DIVISI_OPTIONS = ["Ikhwan", "Akhwat"];

type Santri = { id: string; nama: string; nomorInduk: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function TransaksiFormDialog({ open, onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<TransaksiPayload>({
    tanggal: today,
    tipe: "",
    nominal: 0,
    keterangan: "",
    divisi: "",
    santriId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [santriOpen, setSantriOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/kas/santri").then((r) => r.json()).then(setSantriList);
    }
  }, [open]);

  function set<K extends keyof TransaksiPayload>(field: K, value: TransaksiPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    setForm({ tanggal: today, tipe: "", nominal: 0, keterangan: "", divisi: "", santriId: undefined });
    setError("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/kas/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nominal: Number(form.nominal) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    onSuccess();
    handleClose();
  }

  const selectedSantri = santriList.find((s) => s.id === form.santriId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={form.tanggal}
                onChange={(e) => set("tanggal", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={form.tipe} onValueChange={(v) => set("tipe", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nominal (Rp)</Label>
              <Input
                type="number"
                min="1"
                value={form.nominal || ""}
                onChange={(e) => set("nominal", Number(e.target.value))}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Divisi</Label>
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

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea
              value={form.keterangan}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("keterangan", e.target.value)}
              placeholder="Keterangan transaksi..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Santri{" "}
              <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Popover open={santriOpen} onOpenChange={setSantriOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selectedSantri
                    ? `${selectedSantri.nama} (${selectedSantri.nomorInduk})`
                    : "Pilih santri..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Cari santri..." />
                  <CommandList>
                    <CommandEmpty>Tidak ditemukan</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__none__"
                        onSelect={() => {
                          setForm((prev) => ({ ...prev, santriId: undefined }));
                          setSantriOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !form.santriId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Tidak ada
                      </CommandItem>
                      {santriList.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={`${s.nama} ${s.nomorInduk}`}
                          onSelect={() => {
                            set("santriId", s.id);
                            setSantriOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.santriId === s.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.nama}{" "}
                          <span className="text-muted-foreground ml-1 text-xs">
                            {s.nomorInduk}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

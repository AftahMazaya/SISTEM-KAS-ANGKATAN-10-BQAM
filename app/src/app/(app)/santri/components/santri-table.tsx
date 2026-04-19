"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, GraduationCap, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SantriFormDialog, type SantriData } from "./santri-form";
import { SantriImportDialog } from "./santri-import";

type Santri = {
  id: string;
  nomorInduk: string;
  nama: string;
  kelas: string;
  divisi: string;
  isActive: boolean;
};

export function SantriTable({ canEdit }: { canEdit: boolean }) {
  const [data, setData] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<SantriData | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [naikOpen, setNaikOpen] = useState(false);
  const [luluskan, setLuluskan] = useState(false);
  const [naik, setNaik] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/kas/santri?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  function openEdit(s: Santri) {
    setEditData({ id: s.id, nomorInduk: s.nomorInduk, nama: s.nama, kelas: s.kelas, divisi: s.divisi });
    setFormOpen(true);
  }

  function openAdd() {
    setEditData(undefined);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/kas/santri/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);
    fetchData();
  }

  async function handleNaikKelas() {
    setNaik(true);
    await fetch("/api/kas/santri/naik-kelas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ luluskan }),
    });
    setNaik(false);
    setNaikOpen(false);
    setLuluskan(false);
    fetchData();
  }

  function kelasColor(kelas: string): string {
    if (kelas.startsWith("XII.")) return "bg-green-100 text-green-700";
    if (kelas.startsWith("XI.")) return "bg-purple-100 text-purple-700";
    if (kelas.startsWith("X.")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  }

  const xiiCount = data.filter((s) => s.kelas.startsWith("XII.")).length;
  const xiCount = data.filter((s) => s.kelas.startsWith("XI.")).length;
  const xCount = data.filter((s) => s.kelas.startsWith("X.")).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau nomor induk..."
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => setNaikOpen(true)}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Naik Kelas
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          )}
          {canEdit && (
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Santri
            </Button>
          )}
        </div>
      </div>

      {/* Rekap kelas */}
      {!loading && data.length > 0 && (
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Kelas X: {xCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
            Kelas XI: {xiCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Kelas XII: {xiiCount}
          </span>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nomor Induk</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Divisi</TableHead>
              {canEdit && <TableHead className="w-24 text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} className="py-12 text-center text-muted-foreground text-sm">
                  {q ? "Santri tidak ditemukan" : "Belum ada data santri"}
                </TableCell>
              </TableRow>
            ) : (
              data.map((s, i) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{s.nomorInduk}</TableCell>
                  <TableCell className="font-medium">{s.nama}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${kelasColor(s.kelas)}`}>
                      {s.kelas}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.divisi}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <p className="text-xs text-muted-foreground">{data.length} santri ditemukan</p>
      )}

      <SantriFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchData}
        initial={editData}
      />

      <SantriImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={fetchData}
      />

      {/* Dialog Naik Kelas */}
      <Dialog open={naikOpen} onOpenChange={setNaikOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Kenaikan Kelas Massal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm text-muted-foreground">
            <p>Semua santri aktif akan dinaikkan satu tingkat:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Kelas X.x → XI.x ({xCount} santri)</li>
              <li>Kelas XI.x → XII.x ({xiCount} santri)</li>
              {xiiCount > 0 && (
                <li className={luluskan ? "text-destructive" : ""}>
                  Kelas XII.x → {luluskan ? `Lulus / nonaktif (${xiiCount} santri)` : "tidak berubah"}
                </li>
              )}
            </ul>
            {xiiCount > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="luluskan"
                  checked={luluskan}
                  onCheckedChange={(v) => setLuluskan(!!v)}
                />
                <Label htmlFor="luluskan" className="cursor-pointer text-sm">
                  Luluskan & nonaktifkan kelas XII ({xiiCount} santri)
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNaikOpen(false); setLuluskan(false); }}>
              Batal
            </Button>
            <Button onClick={handleNaikKelas} disabled={naik}>
              {naik && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Naikkan Kelas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Santri?</AlertDialogTitle>
            <AlertDialogDescription>
              Santri akan dinonaktifkan dan tidak tampil di daftar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

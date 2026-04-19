"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { SantriFormDialog, type SantriData } from "./santri-form";

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

  const kelasColor: Record<string, string> = {
    X: "bg-blue-100 text-blue-700",
    XI: "bg-purple-100 text-purple-700",
    XII: "bg-green-100 text-green-700",
  };

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
        {canEdit && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Santri
          </Button>
        )}
      </div>

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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${kelasColor[s.kelas] ?? "bg-gray-100 text-gray-700"}`}>
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

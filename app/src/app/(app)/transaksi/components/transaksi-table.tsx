"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { TransaksiFormDialog } from "./transaksi-form";

type Transaksi = {
  id: string;
  tanggal: string;
  tipe: string;
  nominal: number;
  keterangan: string;
  divisi: string;
  inputBy: string;
  santri?: { nama: string; nomorInduk: string } | null;
};

const DIVISI_OPTIONS = ["IPA 1", "IPA 2", "IPS 1", "IPS 2", "Bahasa"];

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function now() {
  const d = new Date();
  return { bulan: d.getMonth() + 1, tahun: d.getFullYear() };
}

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export function TransaksiTable({
  canEdit,
  canDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
}) {
  const { bulan: initBulan, tahun: initTahun } = now();
  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipe, setTipe] = useState("all");
  const [divisi, setDivisi] = useState("all");
  const [bulan, setBulan] = useState(String(initBulan));
  const [tahun, setTahun] = useState(String(initTahun));
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tipe !== "all") params.set("tipe", tipe);
    if (divisi !== "all") params.set("divisi", divisi);
    if (bulan !== "all") params.set("bulan", bulan);
    if (tahun) params.set("tahun", tahun);
    const res = await fetch(`/api/kas/transaksi?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [tipe, divisi, bulan, tahun]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/kas/transaksi/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);
    fetchData();
  }

  const totalPemasukan = data
    .filter((t) => t.tipe === "Pemasukan")
    .reduce((a, b) => a + b.nominal, 0);
  const totalPengeluaran = data
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((a, b) => a + b.nominal, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  const years = Array.from({ length: 5 }, (_, i) => String(initTahun - i));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pemasukan</p>
            <p className="text-lg font-semibold text-emerald-600">{fmt(totalPemasukan)}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pengeluaran</p>
            <p className="text-lg font-semibold text-rose-600">{fmt(totalPengeluaran)}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className={`p-2 rounded-lg ${saldo >= 0 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Periode</p>
            <p className={`text-lg font-semibold ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {fmt(saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={tipe} onValueChange={setTipe}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="Pemasukan">Pemasukan</SelectItem>
            <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>

        <Select value={divisi} onValueChange={setDivisi}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Divisi</SelectItem>
            {DIVISI_OPTIONS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={bulan} onValueChange={setBulan}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            {MONTHS.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tahun} onValueChange={setTahun}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          {canEdit && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transaksi
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10">#</TableHead>
              <TableHead className="w-32">Tanggal</TableHead>
              <TableHead className="w-28">Tipe</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-24">Divisi</TableHead>
              <TableHead className="w-40">Santri</TableHead>
              <TableHead className="w-36 text-right">Nominal</TableHead>
              {canDelete && <TableHead className="w-14 text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 8 : 7} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 8 : 7} className="py-12 text-center text-muted-foreground text-sm">
                  Belum ada transaksi pada periode ini
                </TableCell>
              </TableRow>
            ) : (
              data.map((t, i) => (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                  <TableCell className="text-sm">{fmtDate(t.tanggal)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        t.tipe === "Pemasukan"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {t.tipe}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{t.keterangan}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.divisi}</TableCell>
                  <TableCell className="text-sm">
                    {t.santri ? (
                      <span>
                        {t.santri.nama}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({t.santri.nomorInduk})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm font-medium ${
                      t.tipe === "Pemasukan" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {t.tipe === "Pengeluaran" ? "-" : "+"}
                    {fmt(t.nominal)}
                  </TableCell>
                  {canDelete && (
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <p className="text-xs text-muted-foreground">{data.length} transaksi ditemukan</p>
      )}

      <TransaksiFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchData}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Data transaksi akan dihapus permanen dan tidak dapat dikembalikan.
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

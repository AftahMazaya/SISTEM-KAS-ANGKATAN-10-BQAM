"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Download, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { KELAS_OPTIONS, DIVISI_OPTIONS } from "./santri-form";

const ALL_KELAS = Object.values(KELAS_OPTIONS).flat();

type Row = {
  nomorInduk: string;
  nama: string;
  kelas: string;
  divisi: string;
  error?: string;
};

type ImportResult = {
  inserted: number;
  skipped: number;
  errors: { nomorInduk: string; error: string }[];
};

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [nomorInduk = "", rawNama = "", kelas = "", rawDivisi = ""] = cols;
    const nama = toTitleCase(rawNama);
    const divisi = toTitleCase(rawDivisi.toLowerCase());

    let error: string | undefined;
    if (!nomorInduk) error = "Nomor induk kosong";
    else if (!nama) error = "Nama kosong";
    else if (!ALL_KELAS.includes(kelas)) error = `Kelas "${kelas}" tidak valid`;
    else if (!DIVISI_OPTIONS.includes(divisi)) error = `Divisi "${divisi}" tidak valid`;

    rows.push({ nomorInduk, nama, kelas, divisi, error });
  }
  return rows;
}

function downloadTemplate() {
  const header = "nomorInduk,nama,kelas,divisi";
  const example = [
    "250421,Ahmad Fauzi,X.A,Ikhwan",
    "250422,Siti Aisyah,X.C,Akhwat",
    "250423,Budi Santoso,X.B,Ikhwan",
  ].join("\n");
  const blob = new Blob([header + "\n" + example], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-import-santri.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function SantriImportDialog({ open, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleClose() {
    setRows([]);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  }

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleImport() {
    if (!validRows.length) return;
    setLoading(true);
    const res = await fetch("/api/kas/santri/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: validRows }),
    });
    const json: ImportResult = await res.json();
    setLoading(false);
    setResult(json);
    if (json.inserted > 0) onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Data Santri</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden flex-1">
          {/* Upload area */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <label className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                <Upload className="mr-2 h-4 w-4" />
                {rows.length > 0 ? `${rows.length} baris terbaca` : "Pilih File CSV"}
              </Button>
            </label>
          </div>

          {/* Validation summary */}
          {rows.length > 0 && !result && (
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {validRows.length} valid
              </span>
              {invalidRows.length > 0 && (
                <span className="text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {invalidRows.length} error (tidak akan diimport)
                </span>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <p className="text-emerald-600 font-medium">
                ✓ {result.inserted} santri berhasil diimport
              </p>
              {result.skipped > 0 && (
                <p className="text-muted-foreground">
                  {result.skipped} dilewati (nomor induk sudah ada)
                </p>
              )}
              {result.errors.length > 0 && (
                <p className="text-destructive">{result.errors.length} error</p>
              )}
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="overflow-auto flex-1 rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Nomor Induk</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow
                      key={i}
                      className={r.error ? "bg-destructive/5" : ""}
                    >
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{r.nomorInduk}</TableCell>
                      <TableCell className="text-sm">{r.nama}</TableCell>
                      <TableCell className="text-sm">{r.kelas}</TableCell>
                      <TableCell className="text-sm">{r.divisi}</TableCell>
                      <TableCell className="text-xs">
                        {r.error ? (
                          <span className="text-destructive">{r.error}</span>
                        ) : (
                          <span className="text-emerald-600">OK</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={handleClose}>
            {result ? "Tutup" : "Batal"}
          </Button>
          {!result && validRows.length > 0 && (
            <Button onClick={handleImport} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {validRows.length} Santri
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import * as XLSX from "xlsx";
import type { CatalogData, Product } from "../types";

export function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Đúng bộ cột chuẩn của shop — dùng cho cả file Excel (.xlsx), CSV (.csv) và file mẫu tải về. */
export const CSV_HEADERS = [
  "Tên sản phẩm",
  "Hãng xe",
  "Tỉ lệ",
  "Loại xe",
  "Hãng mô hình",
  "Màu",
  "Giá (VND)",
  "Giá khuyến mãi",
  "Tồn kho",
  "Link ảnh",
  "Mô tả",
  "Nổi bật",
];

export const TEMPLATE_EXAMPLES: Array<Array<string | number>> = [
  [
    "Ví dụ: Porsche 911 GT3 RS [VÍ DỤ]",
    "Porsche",
    "1:24",
    "Ô tô",
    "Bburago",
    "Đỏ Guards Red",
    450000,
    399000,
    15,
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800",
    "Dòng ví dụ 1: minh họa sản phẩm nhiều màu (dòng này màu Đỏ).",
    "Có",
  ],
  [
    "Ví dụ: Porsche 911 GT3 RS [VÍ DỤ]",
    "Porsche",
    "1:24",
    "Ô tô",
    "Bburago",
    "Vàng Racing Yellow",
    450000,
    399000,
    8,
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    "Dòng ví dụ 2: cùng Tên + Hãng + Tỉ lệ sẽ tự động gộp thành màu thứ 2 của Porsche.",
    "Có",
  ],
  [
    "Ví dụ: Ford Ranger Raptor [VÍ DỤ]",
    "Ford",
    "1:32",
    "Xe bán tải",
    "Welly",
    "Xanh Performance Blue",
    320000,
    290000,
    10,
    "",
    "Mô hình xe bán tải tỉ lệ 1:32 bằng hợp kim, mở được cửa và nắp thùng xe.",
    "Có",
  ],
  [
    "Ví dụ: Vespa Primavera 150 [VÍ DỤ]",
    "Vespa",
    "1:16",
    "Xe máy",
    "Maisto",
    "Trắng Bianco",
    260000,
    "",
    12,
    "",
    "Mô hình xe máy Vespa tỉ lệ 1:16 có chân chống và đánh lái mượt mà.",
    "Không",
  ],
  [
    "Ví dụ: Boeing 787-9 Dreamliner [VÍ DỤ]",
    "Audi",
    "1:24",
    "Máy bay",
    "AUTOart",
    "Trắng xanh Livery",
    580000,
    520000,
    5,
    "",
    "Mô hình máy bay Boeing 787-9 Dreamliner tỉ lệ 1:24 kèm đế trưng bày sang trọng.",
    "Có",
  ],
];

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(products: Product[]) {
  const lines = [CSV_HEADERS.join(",")];
  for (const p of products) {
    for (const v of p.variants) {
      lines.push(
        [
          p.name,
          p.brand,
          p.scale,
          p.vehicleType,
          p.modelMaker ?? "",
          v.colorName,
          v.price,
          v.promoPrice ?? "",
          v.stock,
          /^https?:\/\//i.test(v.imageKey)
            ? v.imageKey
            : /^data:/i.test(v.imageKey)
              ? ""
              : v.imageKey,
          p.description,
          p.isFeatured ? "Có" : "Không",
        ]
          .map(csvEscape)
          .join(","),
      );
    }
  }
  downloadTextFile("san-pham-xe-mo-hinh.csv", lines.join("\n"));
}

export function downloadCsvTemplate() {
  const content = [
    "sep=,",
    CSV_HEADERS.join(","),
    ...TEMPLATE_EXAMPLES.map((row) => row.map(csvEscape).join(",")),
  ].join("\n");

  downloadTextFile("mau-nhap-san-pham.csv", content);
}

export function downloadExcelTemplate(catalog?: CatalogData | null) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([CSV_HEADERS, ...TEMPLATE_EXAMPLES]);
  ws["!cols"] = [
    { wch: 25 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 15 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 35 },
    { wch: 45 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "MauNhapSanPham");

  if (catalog) {
    const maxLen = Math.max(
      catalog.vehicleTypes.length,
      catalog.scales.length,
      catalog.carBrands.length,
      catalog.modelMakers.length,
    );
    const catRows: string[][] = [["Loại xe", "Tỉ lệ", "Hãng xe", "Hãng mô hình"]];
    for (let i = 0; i < maxLen; i++) {
      catRows.push([
        catalog.vehicleTypes[i]?.name ?? "",
        catalog.scales[i]?.name ?? "",
        catalog.carBrands[i]?.name ?? "",
        catalog.modelMakers[i]?.name ?? "",
      ]);
    }
    const wsCat = XLSX.utils.aoa_to_sheet(catRows);
    wsCat["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsCat, "DanhMucChuan");
  }

  XLSX.writeFile(wb, "mau-nhap-san-pham.xlsx");
}

export function downloadExcel(products: Product[]) {
  const rows: Array<Array<string | number>> = [CSV_HEADERS];
  for (const p of products) {
    for (const v of p.variants) {
      rows.push([
        p.name,
        p.brand,
        p.scale,
        p.vehicleType,
        p.modelMaker ?? "",
        v.colorName,
        v.price,
        v.promoPrice ?? "",
        v.stock,
        /^https?:\/\//i.test(v.imageKey)
          ? v.imageKey
          : /^data:/i.test(v.imageKey)
            ? ""
            : v.imageKey,
        p.description,
        p.isFeatured ? "Có" : "Không",
      ]);
    }
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 25 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 15 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 35 },
    { wch: 45 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "SanPham");
  XLSX.writeFile(wb, "san-pham-xe-mo-hinh.xlsx");
}


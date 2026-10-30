// ── Dữ liệu MẪU + công cụ nạp kệ — KHÔNG thuộc bề mặt web khách ─────
// File này CHỈ chứa dữ liệu mẫu [MẪU] (do chủ shop yêu cầu bịa sẵn)
// và bảng gán hãng mô hình mẫu. Nó KHÔNG được import bởi actions.ts,
// nên không có action nạp/sửa kệ nào còn công khai trên web khách.
// Dữ liệu thật trong database KHÔNG được sửa từ file này.

import type { SampleItem } from "./seedTypes";
import { SAMPLE_64 } from "./seedData64";
import { SAMPLE_32_16 } from "./seedData32_16";

export type { SampleItem };

export const SAMPLE: SampleItem[] = [...SAMPLE_64, ...SAMPLE_32_16];

// ── Hãng MÔ HÌNH bịa cho kệ MẪU (chủ shop lệnh trực tiếp 29/10/2026:
// "bạn bịa cho tôi đi") ─────────────────────────────────────────────
// Toàn bộ 50 mẫu dưới đây là dữ liệu mẫu [MẪU]; hãng mô hình gán cho
// chúng cũng là DỮ LIỆU MẪU BỊA — KHÔNG phải hãng mô hình thật đã kiểm
// chứng — và PHẢI thay bằng hãng thật khi hàng thật thay kệ mẫu, giống
// như mọi dữ liệu [MẪU] khác. Gán theo tỉ lệ từ các hãng mô hình thật
// thường làm đúng tỉ lệ đó: 1:64 → Mini GT / Hot Wheels / Tomica /
// Greenlight; 1:32 và 1:16 → Bburago / Maisto / Welly / GT Spirit /
// Norev / AUTOart. Mỗi hãng có đúng một mã trong MODEL_MAKER_CODES
// (sku.ts): GTS, MGT, BB, MAI, WEL, HW, TOM, GLT, AA, NOR. Bảng này là
// nơi DUY NHẤT gán hãng mô hình cho kệ mẫu để chủ shop đối chiếu và
// sửa lại hãng nào không đúng ý.
export const SAMPLE_MODEL_MAKERS: Record<string, string> = {
  // 1:64
  "Toyota GR Supra [MẪU]": "Mini GT",
  "Nissan GT-R R35 [MẪU]": "Tomica",
  "Ford F-150 Raptor Mini [MẪU]": "Greenlight",
  "Chevrolet Pickup 1953 Cổ Điển [MẪU]": "Greenlight",
  "Honda Civic Type R [MẪU]": "Mini GT",
  "Hyundai Elantra N [MẪU]": "Mini GT",
  "Kia K5 GT [MẪU]": "Hot Wheels",
  "Mazda 3 Sport [MẪU]": "Tomica",
  "BMW M2 Coupé [MẪU]": "Mini GT",
  "Audi TT RS [MẪU]": "Hot Wheels",
  "VinFast VF 8 [MẪU]": "Hot Wheels",
  "Toyota Hilux GR Sport Mini [MẪU]": "Greenlight",
  "Nissan Navara Mini [MẪU]": "Greenlight",
  "Honda Wave Alpha [MẪU]": "Hot Wheels",
  "Yamaha Exciter 155 VVA [MẪU]": "Hot Wheels",
  "Vespa Sprint 125 [MẪU]": "Tomica",
  "Suzuki Raider R150 [MẪU]": "Hot Wheels",
  // 1:32
  "Lamborghini Huracán EVO [MẪU]": "Bburago",
  "Porsche 911 Carrera S [MẪU]": "Welly",
  "Range Rover Evoque [MẪU]": "Welly",
  "Ford Mustang GT Fastback [MẪU]": "Maisto",
  "Toyota Camry 2.5Q [MẪU]": "Welly",
  "Honda CR-V [MẪU]": "Welly",
  "Kia Sorento [MẪU]": "Maisto",
  "Mazda CX-5 [MẪU]": "Bburago",
  "Lexus UX 250h [MẪU]": "Maisto",
  "VinFast VF 9 [MẪU]": "Bburago",
  "Mercedes-Benz GLC 300 [MẪU]": "Bburago",
  "Ford Ranger Wildtrak [MẪU]": "Maisto",
  "Chevrolet Colorado [MẪU]": "Maisto",
  "Toyota Hilux Revo [MẪU]": "Welly",
  "Yamaha MT-07 [MẪU]": "Maisto",
  "Honda SH Mode 125 [MẪU]": "Welly",
  "Ducati Monster [MẪU]": "Maisto",
  // 1:16
  "Ferrari F8 Tributo [MẪU]": "Bburago",
  "Mercedes-AMG GT [MẪU]": "Norev",
  "Chevrolet Impala Convertible 1965 [MẪU]": "Maisto",
  "Lamborghini Revuelto [MẪU]": "Bburago",
  "Mercedes-Benz S 500 [MẪU]": "Norev",
  "BMW M8 Gran Coupé [MẪU]": "GT Spirit",
  "Audi RS 7 Sportback [MẪU]": "GT Spirit",
  "Porsche Taycan Turbo S [MẪU]": "AUTOart",
  "Lexus LC 500 [MẪU]": "AUTOart",
  "Ferrari Roma [MẪU]": "Bburago",
  "Ford F-150 Platinum [MẪU]": "Maisto",
  "Chevrolet Silverado [MẪU]": "Maisto",
  "Nissan Titan XD [MẪU]": "Welly",
  "Ducati Panigale V4 [MẪU]": "Maisto",
  "Honda Gold Wing [MẪU]": "Welly",
  "Vespa GTS 300 [MẪU]": "Maisto",
};

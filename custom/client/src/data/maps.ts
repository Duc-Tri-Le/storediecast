// ── Bảng tra ảnh + logo dùng chung cho toàn web ────────────────────
// Ảnh sản phẩm/logo là tài sản tĩnh đóng gói cùng web (assets/). Mọi
// component tra ảnh qua bảng IMG / BRAND_LOGOS và resolveProductImage
// ở đây — không import lẻ ảnh ở từng component nữa.
import heroImg from "../assets/hero.jpg";
import avatarImg from "../assets/avatar.jpg";
import scale164Img from "../assets/scale164.jpg";
import scale132Img from "../assets/scale132.jpg";
import scale116Img from "../assets/scale116.jpg";
import imgToyotaGrSupra from "../assets/prod-toyota-gr-supra.jpg";
import imgNissanGtrR35 from "../assets/prod-nissan-gtr-r35.jpg";
import imgFordF150RaptorMini from "../assets/prod-ford-f150-raptor-mini.jpg";
import imgChevroletPickup1953 from "../assets/prod-chevrolet-pickup-1953.jpg";
import imgLamborghiniHuracanEvo from "../assets/prod-lamborghini-huracan-evo.jpg";
import imgPorsche911CarreraS from "../assets/prod-porsche-911-carrera-s.jpg";
import imgRangeRoverEvoque from "../assets/prod-range-rover-evoque.jpg";
import imgFordMustangGt from "../assets/prod-ford-mustang-gt.jpg";
import imgFerrariF8Tributo from "../assets/prod-ferrari-f8-tributo.jpg";
import imgMercedesAmgGt from "../assets/prod-mercedes-amg-gt.jpg";
import imgChevroletImpala1965 from "../assets/prod-chevrolet-impala-1965.jpg";
import imgLamborghiniRevuelto from "../assets/prod-lamborghini-revuelto.jpg";
import imgHondaCivicTypeR from "../assets/prod-honda-civic-type-r.jpg";
import imgHyundaiElantraN from "../assets/prod-hyundai-elantra-n.jpg";
import imgKiaK5Gt from "../assets/prod-kia-k5-gt.jpg";
import imgMazda3Sport from "../assets/prod-mazda-3-sport.jpg";
import imgBmwM2Coupe from "../assets/prod-bmw-m2-coupe.jpg";
import imgAudiTtRs from "../assets/prod-audi-tt-rs.jpg";
import imgVinfastVf8 from "../assets/prod-vinfast-vf8.jpg";
import imgToyotaHiluxGrMini from "../assets/prod-toyota-hilux-gr-mini.jpg";
import imgNissanNavaraMini from "../assets/prod-nissan-navara-mini.jpg";
import imgHondaWaveAlpha from "../assets/prod-honda-wave-alpha.jpg";
import imgYamahaExciter155 from "../assets/prod-yamaha-exciter-155.jpg";
import imgVespaSprint125 from "../assets/prod-vespa-sprint-125.jpg";
import imgSuzukiRaiderR150 from "../assets/prod-suzuki-raider-r150.jpg";
import imgToyotaCamry from "../assets/prod-toyota-camry.jpg";
import imgHondaCrv from "../assets/prod-honda-crv.jpg";
import imgKiaSorento from "../assets/prod-kia-sorento.jpg";
import imgMazdaCx5 from "../assets/prod-mazda-cx5.jpg";
import imgLexusUx250h from "../assets/prod-lexus-ux-250h.jpg";
import imgVinfastVf9 from "../assets/prod-vinfast-vf9.jpg";
import imgMercedesGlc300 from "../assets/prod-mercedes-glc-300.jpg";
import imgFordRangerWildtrak from "../assets/prod-ford-ranger-wildtrak.jpg";
import imgChevroletColorado from "../assets/prod-chevrolet-colorado.jpg";
import imgToyotaHiluxRevo from "../assets/prod-toyota-hilux-revo.jpg";
import imgYamahaMt07 from "../assets/prod-yamaha-mt07.jpg";
import imgHondaShMode from "../assets/prod-honda-sh-mode.jpg";
import imgDucatiMonster from "../assets/prod-ducati-monster.jpg";
import imgMercedesS500 from "../assets/prod-mercedes-s500.jpg";
import imgBmwM8GranCoupe from "../assets/prod-bmw-m8-gran-coupe.jpg";
import imgAudiRs7Sportback from "../assets/prod-audi-rs7-sportback.jpg";
import imgPorscheTaycan from "../assets/prod-porsche-taycan.jpg";
import imgLexusLc500 from "../assets/prod-lexus-lc500.jpg";
import imgFerrariRoma from "../assets/prod-ferrari-roma.jpg";
import imgFordF150Platinum from "../assets/prod-ford-f150-platinum.jpg";
import imgChevroletSilverado from "../assets/prod-chevrolet-silverado.jpg";
import imgNissanTitanXd from "../assets/prod-nissan-titan-xd.jpg";
import imgDucatiPanigaleV4 from "../assets/prod-ducati-panigale-v4.jpg";
import imgHondaGoldWing from "../assets/prod-honda-gold-wing.jpg";
import imgVespaGts300 from "../assets/prod-vespa-gts-300.jpg";
import imgFerrariF8Giallo from "../assets/prod-ferrari-f8-tributo-giallo.jpg";
import imgFerrariF8Nero from "../assets/prod-ferrari-f8-tributo-nero.jpg";
import imgBmwM8Sapphire from "../assets/prod-bmw-m8-gran-coupe-sapphire.jpg";
import imgBmwM8Alpine from "../assets/prod-bmw-m8-gran-coupe-alpine.jpg";
import imgHondaWaveRed from "../assets/prod-honda-wave-alpha-red.jpg";
import imgHondaWaveBlack from "../assets/prod-honda-wave-alpha-black.jpg";
import imgRangerWhite from "../assets/prod-ford-ranger-wildtrak-white.jpg";
import imgRangerGray from "../assets/prod-ford-ranger-wildtrak-gray.jpg";
import imgPanigaleStealth from "../assets/prod-ducati-panigale-v4-stealth.jpg";
import logoHonda from "../assets/brand-honda.png";
import logoChevrolet from "../assets/brand-chevrolet.png";
import logoFord from "../assets/brand-ford.png";
import logoToyota from "../assets/brand-toyota.png";
import logoMercedesBenz from "../assets/brand-mercedes-benz.png";
import logoNissan from "../assets/brand-nissan.png";
import logoAudi from "../assets/brand-audi.png";
import logoBmw from "../assets/brand-bmw.png";
import logoDucati from "../assets/brand-ducati.png";
import logoFerrari from "../assets/brand-ferrari.png";
import logoKia from "../assets/brand-kia.png";
import logoLamborghini from "../assets/brand-lamborghini.png";
import logoLexus from "../assets/brand-lexus.png";
import logoMazda from "../assets/brand-mazda.png";
import logoPorsche from "../assets/brand-porsche.png";
import logoVespa from "../assets/brand-vespa.png";
import logoVinfast from "../assets/brand-vinfast.png";
import logoYamaha from "../assets/brand-yamaha.png";
import logoHyundai from "../assets/brand-hyundai.png";
import logoLandRover from "../assets/brand-land-rover.png";

/** Logo THẬT của từng hãng trên kệ (tải về từ kết quả tìm kiếm ảnh, đã
    gỡ nền và cắt viền thừa, lưu thành tài sản riêng của web). Hãng nào
    không có trong bảng này thì ô của hãng đó tạm hiện tên hãng dạng chữ
    đơn giản để vẫn bấm được — không bịa logo, không dùng ảnh sản phẩm
    thay cho logo. */
export const BRAND_LOGOS: Record<string, string> = {
  Honda: logoHonda,
  Chevrolet: logoChevrolet,
  Ford: logoFord,
  Toyota: logoToyota,
  "Mercedes-Benz": logoMercedesBenz,
  Nissan: logoNissan,
  Audi: logoAudi,
  BMW: logoBmw,
  Ducati: logoDucati,
  Ferrari: logoFerrari,
  Kia: logoKia,
  Lamborghini: logoLamborghini,
  Lexus: logoLexus,
  Mazda: logoMazda,
  Porsche: logoPorsche,
  Vespa: logoVespa,
  VinFast: logoVinfast,
  Yamaha: logoYamaha,
  Hyundai: logoHyundai,
  "Land Rover": logoLandRover,
};


export const IMG: Record<string, string> = {
  hero: heroImg,
  scale164: scale164Img,
  scale132: scale132Img,
  scale116: scale116Img,
  "toyota-gr-supra": imgToyotaGrSupra,
  "nissan-gtr-r35": imgNissanGtrR35,
  "ford-f150-raptor-mini": imgFordF150RaptorMini,
  "chevrolet-pickup-1953": imgChevroletPickup1953,
  "lamborghini-huracan-evo": imgLamborghiniHuracanEvo,
  "porsche-911-carrera-s": imgPorsche911CarreraS,
  "range-rover-evoque": imgRangeRoverEvoque,
  "ford-mustang-gt": imgFordMustangGt,
  "ferrari-f8-tributo": imgFerrariF8Tributo,
  "mercedes-amg-gt": imgMercedesAmgGt,
  "chevrolet-impala-1965": imgChevroletImpala1965,
  "lamborghini-revuelto": imgLamborghiniRevuelto,
  "honda-civic-type-r": imgHondaCivicTypeR,
  "hyundai-elantra-n": imgHyundaiElantraN,
  "kia-k5-gt": imgKiaK5Gt,
  "mazda-3-sport": imgMazda3Sport,
  "bmw-m2-coupe": imgBmwM2Coupe,
  "audi-tt-rs": imgAudiTtRs,
  "vinfast-vf8": imgVinfastVf8,
  "toyota-hilux-gr-mini": imgToyotaHiluxGrMini,
  "nissan-navara-mini": imgNissanNavaraMini,
  "honda-wave-alpha": imgHondaWaveAlpha,
  "yamaha-exciter-155": imgYamahaExciter155,
  "vespa-sprint-125": imgVespaSprint125,
  "suzuki-raider-r150": imgSuzukiRaiderR150,
  "toyota-camry": imgToyotaCamry,
  "honda-crv": imgHondaCrv,
  "kia-sorento": imgKiaSorento,
  "mazda-cx5": imgMazdaCx5,
  "lexus-ux-250h": imgLexusUx250h,
  "vinfast-vf9": imgVinfastVf9,
  "mercedes-glc-300": imgMercedesGlc300,
  "ford-ranger-wildtrak": imgFordRangerWildtrak,
  "chevrolet-colorado": imgChevroletColorado,
  "toyota-hilux-revo": imgToyotaHiluxRevo,
  "yamaha-mt07": imgYamahaMt07,
  "honda-sh-mode": imgHondaShMode,
  "ducati-monster": imgDucatiMonster,
  "mercedes-s500": imgMercedesS500,
  "bmw-m8-gran-coupe": imgBmwM8GranCoupe,
  "audi-rs7-sportback": imgAudiRs7Sportback,
  "porsche-taycan": imgPorscheTaycan,
  "lexus-lc500": imgLexusLc500,
  "ferrari-roma": imgFerrariRoma,
  "ford-f150-platinum": imgFordF150Platinum,
  "chevrolet-silverado": imgChevroletSilverado,
  "nissan-titan-xd": imgNissanTitanXd,
  "ducati-panigale-v4": imgDucatiPanigaleV4,
  "honda-gold-wing": imgHondaGoldWing,
  "vespa-gts-300": imgVespaGts300,
  "ferrari-f8-tributo-giallo": imgFerrariF8Giallo,
  "ferrari-f8-tributo-nero": imgFerrariF8Nero,
  "bmw-m8-gran-coupe-sapphire": imgBmwM8Sapphire,
  "bmw-m8-gran-coupe-alpine": imgBmwM8Alpine,
  "honda-wave-alpha-red": imgHondaWaveRed,
  "honda-wave-alpha-black": imgHondaWaveBlack,
  "ford-ranger-wildtrak-white": imgRangerWhite,
  "ford-ranger-wildtrak-gray": imgRangerGray,
  "ducati-panigale-v4-stealth": imgPanigaleStealth,
};
// ── Phân giải ảnh sản phẩm ──────────────────────────────────────────
// Hệ thống quản lý của shop (dùng chung database) lưu ảnh cho từng biến thể màu
// dưới dạng link https hoặc data URL (ảnh tải lên từ máy được nén
// thành data URL) ngay trong trường imageKey của biến thể / bảng ảnh
// sản phẩm. Các mẫu cũ vẫn dùng mã tĩnh (ví dụ "toyota-gr-supra")
// tra qua bảng IMG ở trên. Quy tắc ở MỌI nơi hiện ảnh sản phẩm phía
// khách (thẻ sản phẩm, trang chi tiết, giỏ hàng, đơn hàng):
//   1. imageKey là link https/http hoặc data URL → dùng TRỰC TIẾP
//      giá trị đó làm src, không qua bảng mã tĩnh.
//   2. Ngược lại → tra bảng mã tĩnh IMG như trước; không có mã thì
//      rơi về ảnh dự phòng (mặc định ảnh tỉ lệ 1:32, hoặc fallback
//      do nơi gọi truyền vào — ví dụ ảnh bộ sưu tập).
export function isDirectImageSrc(key: string | null | undefined): boolean {
  if (!key) return false;
  const t = key.trim().toLowerCase();
  return t.startsWith("https://") || t.startsWith("http://") || t.startsWith("data:");
}

export function resolveProductImage(
  imageKey: string | null | undefined,
  fallback: string = scale132Img,
): string {
  if (!imageKey) return fallback;
  const t = imageKey.trim();
  if (!t) return fallback;
  if (isDirectImageSrc(t)) return t;
  return IMG[t] ?? fallback;
}
export { heroImg, avatarImg, scale164Img, scale132Img, scale116Img };

# Lifechan - Eksik Özellikler ve Yapılacaklar

## Durum
- Proje: Next.js + TypeScript + Tailwind (src dizini)
- DB: Neon Postgres + Prisma şeması hazır (User, Post, Comment, Like, Follow, VerificationToken)
- Depolama: Cloudinary ayarlandı (.env)
- Auth/Email: Resend + NEXTAUTH_SECRET ayarlandı
- Deploy: GitHub (berkchy/lifechan), Vercel bağlı

## Kritik Eksikler

### 1) Auth & Güvenlik
- [ ] Auth.js v5 kurulum (prisma adapter)
- [ ] Kayıt/giriş API (bcrypt)
- [ ] Email doğrulama (Resend)
- [ ] Session yönetimi (JWT/session cookie)
- [ ] Cihaz koruması: fingerprint + IP (deviceFingerprint/IP hash)
- [ ] Rate limiting (auth endpointleri)
- [ ] CSRF + zod validasyon

### 2) Post Sistemi
- [ ] Post oluşturma API (Cloudinary upload)
- [ ] Thumbnail oluşturma
- [ ] 5 dk cooldown (lastPostAt kontrolü)
- [ ] Post silme (sadece sahibi)
- [ ] Post indirme özelliği (UI + link)

### 3) Akış & Arama
- [ ] Ana sayfa: en son postlar
- [ ] Sayfalı grid + responsive masonry
- [ ] Tag sistemi + tag arama/filtre
- [ ] Post detay sayfası

### 4) Sosyal Özellikler
- [ ] Beğeni (like/unlike)
- [ ] Yorum (create) + cevap (reply)
- [ ] Yorum sabitleme (sadece post sahibi)
- [ ] Takip/ takipten çıkma (Instagram tarzı)
- [ ] Gizli hesaplar (private) - takip etmeden gizli hesap postlarını gösterme
- [ ] Takipçilerden çıkarma
- [ ] Profil sayfası + düzenleme + ayarlar

### 5) UI/UX
- [ ] Navbar, auth sayfaları
- [ ] Upload sayfası
- [ ] Feed sayfası
- [ ] Profil sayfası
- [ ] Post detay sayfası
- [ ] Ayarlar sayfası

### 6) Test & Deployment
- [ ] Birim testler (cooldown, device guard)
- [ ] .env.production kontrolü
- [ ] Prisma migrate (Vercel'de otomatik)
- [ ] Build testi

## Öncelik
1. Auth.js + DB bağlantısı
2. Upload + Post API
3. Feed + Post detay
4. Sosyal özellikler
5. Güvenlik + testler

## Notlar
- Medya: Cloudinary kullanılıyor (env hazır)
- DB: Neon hazır
- Email: Resend hazır

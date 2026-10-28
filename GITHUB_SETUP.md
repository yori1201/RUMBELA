# 🚀 Cara Push ke GitHub

Panduan step-by-step untuk upload project Rumbela English Quest ke GitHub.

---

## 📋 Persiapan

### 1. Pastikan sudah punya akun GitHub
Kalau belum, daftar di [github.com](https://github.com) (gratis).

### 2. Install Git di komputer (kalau belum)
- **Windows**: Download dari [git-scm.com](https://git-scm.com/download/win)
- **Mac**: `brew install git`
- **Linux**: `sudo apt install git` / `sudo dnf install git`

Cek instalasi:
```bash
git --version
```

---

## 🔧 Langkah-langkah

### Langkah 1: Buat Repository Baru di GitHub

1. Login ke [github.com](https://github.com)
2. Klik tombol **"+"** di kanan atas → **"New repository"**
3. Isi form:
   - **Repository name**: `rumbela-english-quest`
   - **Description**: `Game belajar Bahasa Inggris interaktif untuk Bimbel Rumbela`
   - **Visibility**: Public (gratis) atau Private
   - **JANGAN centang** "Add a README", ".gitignore", atau "license" — biar kosong, karena kita sudah punya sendiri
4. Klik **"Create repository"**
5. **Copy URL repo** yang muncul, contoh:
   ```
   https://github.com/USERNAME/rumbela-english-quest.git
   ```

### Langkah 2: Setup Git Lokal (di folder project)

Buka terminal di folder project:

```bash
# Set identitas git (sekali saja per komputer)
git config --global user.name "Nama Kamu"
git config --global user.email "email@kamu.com"
```

### Langkah 3: Hubungkan Repo Lokal ke GitHub

```bash
# Ganti USERNAME dengan username GitHub kamu
git remote add origin https://github.com/USERNAME/rumbela-english-quest.git

# Verifikasi remote
git remote -v
```

Kalau salah URL dan mau ganti:
```bash
git remote set-url origin https://github.com/USERNAME/rumbela-english-quest.git
```

### Langkah 4: Push ke GitHub

```bash
# Push branch 'main' ke GitHub
git push -u origin main
```

Saat pertama kali push, Git akan minta login. Ada 2 opsi:

#### Opsi A: HTTPS + Personal Access Token (paling mudah)
1. Buka [github.com/settings/tokens](https://github.com/settings/tokens)
2. Klik **"Generate new token (classic)"**
3. Beri nama, centang scope **"repo"**, generate
4. Copy token
5. Saat push, masukkan:
   - **Username**: username GitHub kamu
   - **Password**: paste token (BUKAN password akun GitHub)

#### Opsi B: SSH (lebih aman, setup sekali)
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "email@kamu.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub
```
- Buka [github.com/settings/keys](https://github.com/settings/keys)
- Klik **"New SSH key"**, paste public key, save

Ganti remote ke SSH:
```bash
git remote set-url origin git@github.com:USERNAME/rumbela-english-quest.git
git push -u origin main
```

### Langkah 5: Verifikasi

1. Buka repo di GitHub → harusnya semua file terlihat
2. Edit README.md → file README akan otomatis tampil di homepage repo

---

## 🔄 Update Selanjutnya

Setiap kali ada perubahan, lakukan:

```bash
# Cek file yang berubah
git status

# Tambahkan semua perubahan
git add -A

# Commit dengan pesan deskriptif
git commit -m "feat: tambah 10 soal vocabulary baru"
git commit -m "fix: perbaiki bug timer di quiz mode"
git commit -m "docs: update README"

# Push ke GitHub
git push
```

---

## 📦 Format Pesan Commit (Conventional Commits)

Ikuti format ini biar history rapi:

| Prefix | Arti | Contoh |
|--------|------|--------|
| `feat:` | Fitur baru | `feat: tambah mode listening dengan TTS` |
| `fix:` | Bug fix | `fix: timer tidak pause saat showResult` |
| `docs:` | Dokumentasi | `docs: update cara install` |
| `style:` | Formatting | `style: rapihin indent di Mascot.tsx` |
| `refactor:` | Refactor kode | `refactor: pecah HomeScreen jadi 2 komponen` |
| `chore:` | Maintenance | `chore: update dependencies` |
| `assets:` | Asset baru | `assets: tambah 2 frame animasi Bela` |

---

## 🌐 Deploy ke Vercel (opsional, gratis)

Setelah repo di GitHub, tinggal sekali klik untuk deploy:

1. Buka [vercel.com](https://vercel.com) → login pakai akun GitHub
2. Klik **"Add New"** → **"Project"**
3. Pilih repo `rumbela-english-quest`
4. Vercel auto-deteksi Next.js → langsung klik **"Deploy"**
5. Tunggu ~2 menit → aplikasi online!
6. Akan dapat URL seperti `rumbela-english-quest.vercel.app`
7. Bisa set custom domain juga kalau punya

**Bonus**: Setiap `git push` ke main, Vercel auto-deploy ulang. Canggih!

---

## 🆘 Troubleshooting

### Error: `remote origin already exists`
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/rumbela-english-quest.git
```

### Error: `failed to push some refs`
Repo GitHub ada isinya (misal ada README bawaan). Force push:
```bash
git push -u origin main --force
```

### Error: `Permission denied (publickey)`
Setup SSH key (lihat Opsi B di atas).

### Lupa token / muncul prompt terus
```bash
# Pakai credential helper
git config --global credential.helper store
# Push sekali lagi, simpan credentials
```

### File besar ditolak (>100MB)
GitHub batas 100MB per file. Kalau ada file besar:
```bash
# Cari file besar
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/blob/ {if ($3 > 104857600) print $4, $3}'
# Hapus dari history pakai git filter-repo
```

---

## ✅ Checklist Akhir

- [ ] Akun GitHub dibuat
- [ ] Repo `rumbela-english-quest` dibuat (kosong, tanpa README)
- [ ] `git remote add origin <URL>` berhasil
- [ ] `git push -u origin main` berhasil
- [ ] File-file project terlihat di GitHub
- [ ] (Opsional) Deploy ke Vercel berhasil
- [ ] URL aplikasi online bisa dibuka siswa

---

## 🎉 Selamat!

Project Rumbela English Quest sudah live di GitHub. Bisa di-share ke siswa, guru, atau tim pengembang lain untuk kolaborasi!

**Happy coding! 🌱✨**

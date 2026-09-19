# 019 Cara Membagikan Berkas CT, MRI, dan Pencitraan Lain ke Rumah Sakit Tiongkok

## Hero

- **Title:** Cara Membagikan Berkas CT, MRI, dan Pencitraan Lain ke Rumah Sakit Tiongkok
- **Category:** Panduan Layanan Kesehatan di Tiongkok
- **Subcategory:** Pencitraan dan Rekam Medis
- **Subtitle:** Kirimkan pemeriksaan diagnostik lengkap, laporan, dan pertanyaan klinis—bukan beberapa tangkapan layar yang tidak dapat digulir, diukur, atau dibandingkan.
- **Reviewed by:** Tim Editorial Medora Health; tinjauan radiologi dan keamanan informasi diperlukan sebelum publikasi
- **Updated date:** 2026/08/03
- **Hero image:** `hero-reviewed.png`
- **Image alt text:** Seorang radiolog Tiongkok mendiskusikan pencitraan penampang lintang dengan pasien internasional

## Key Takeaways

- DICOM adalah format standar untuk bertukar gambar medis dengan data dan kualitas yang dibutuhkan untuk penggunaan klinis.[1] Mintalah pemeriksaan DICOM lengkap dari fasilitas pencitraan.
- Kirimkan gambar sekaligus laporan radiologi akhir. Yang satu memungkinkan pembacaan ulang; yang lain mencatat penafsiran asli, teknik, dan perbandingan.
- Uji berkas sebelum mengunggah. Pastikan pasien, tanggal pemeriksaan, bagian tubuh, seri, dan jumlah gambar yang benar; unduhan berhasil bukan bukti bahwa pemeriksaan lengkap.
- Berkas DICOM memuat data pasien dan pemeriksaan yang tertanam. Mengganti nama folder tidak menghilangkan informasi identitas.[2]
- Dapatkan konfirmasi penerimaan dan impor dari rumah sakit, lalu tanyakan apakah radiolog benar-benar meninjau gambarnya. Unggahan administratif bukan pendapat klinis.

## Content

Foto film MRI mungkin menunjukkan kelainan yang dapat dikenali. Namun, foto itu tetap menghalangi radiolog penerima menggulir irisan, mengubah pengaturan jendela, mengukur lesi, memeriksa sekuens akuisisi, atau membandingkan gambar sebelumnya secara tepat.

Untuk tinjauan yang sesungguhnya, siapkan paket pemindahan dengan tiga bagian: data gambar diagnostik lengkap, laporan yang ditandatangani atau laporan akhir, dan pertanyaan klinis singkat. Tugas belum selesai ketika pasien mengeklik “kirim.” Tugas selesai ketika rumah sakit yang benar mengimpor pemeriksaan lengkap dan mengonfirmasi siapa yang akan menafsirkannya.

## Mintalah Ekspor yang Tepat dari Pusat Pencitraan

Gunakan frasa “pemeriksaan DICOM lengkap dengan semua seri diagnostik.” DICOM—Digital Imaging and Communications in Medicine—adalah standar internasional untuk gambar medis dan informasi terkait serta digunakan dalam CT, MRI, radiografi, ultrasonografi, kedokteran nuklir, radioterapi, dan sistem lainnya.[1]

Mintalah:

- Berkas DICOM asli untuk setiap seri yang relevan
- Indeks `DICOMDIR` ketika ekspor menyediakannya
- Laporan radiologi akhir dan adendum apa pun
- Tanggal pemeriksaan, modalitas, dan wilayah tubuh
- Apakah kontras digunakan dan, jika dicatat, informasi fase atau sekuens
- Pemeriksaan terdahulu yang relevan untuk perbandingan
- Ekspor pada cakram, unduhan aman, atau jalur cloud yang disetujui rumah sakit

Jangan hanya meminta “gambarnya.” Jika demikian, sebagian meja ekspor akan menghasilkan gambar kunci JPEG atau lembar kontak PDF.

## Ketahui Perbedaan Empat Format Umum

### Pemeriksaan DICOM

Ini adalah kumpulan data diagnostik. Isinya membawa piksel gambar beserta atribut yang menggambarkan pasien, pemeriksaan, seri, dan akuisisi. CT atau MRI biasanya memuat banyak berkas dan seri, bukan satu gambar.[2]

### Penampil DICOM

Cakram mungkin menyertakan perangkat lunak yang menampilkan pemeriksaan. Penampil bukan pemeriksaan itu sendiri. Jika program gagal berjalan pada sistem operasi lain, berkas DICOM mentah seharusnya tetap ada dan dapat diimpor.

### Laporan radiologi

Laporan adalah penafsiran radiolog asli. Laporan harus menyatakan pemeriksaan, temuan, dan kesimpulan serta dapat menjelaskan teknik, kontras, keterbatasan, dan perbandingan. American College of Radiology menyatakan bahwa informasi klinis yang relevan dan pertanyaan spesifik meningkatkan kegunaan penafsiran, serta pemeriksaan pembanding harus digunakan bila sesuai dan tersedia.[3]

### JPEG, PNG, PDF, atau foto ponsel

Format-format ini adalah pratinjau yang praktis. Biasanya format ini menghilangkan navigasi irisan, metadata, rentang dinamis, dan kemampuan pengukuran. Gunakan hanya untuk menunjukkan temuan—bukan sebagai pemindahan diagnostik utama.

## Pilih Pemeriksaan Berdasarkan Pertanyaan Klinis

Tuliskan pertanyaan sepanjang satu atau dua kalimat, misalnya:

- Apakah lesi pankreas secara teknis dapat direseksi?
- Apakah penyakit paru berkembang dibandingkan pemindaian sebelum pengobatan lini kedua?
- Tingkat tulang belakang mana yang menjelaskan defisit neurologis saat ini?
- Apakah kumpulan cairan pascaoperasi berubah, dan apakah memerlukan penilaian mendesak?

Lalu sertakan garis waktu pencitraan yang relevan. Pemindaian terbaru saja mungkin tidak cukup. Penilaian respons sering bergantung pada data dasar sebelum pengobatan; perencanaan operasi mungkin memerlukan fase kontras tertentu; dugaan komplikasi mungkin memerlukan pemeriksaan segera setelah operasi.

Tanyakan kepada tenaga klinis atau radiolog penerima pemeriksaan mana yang diperlukan. Mengirim setiap pemindaian sejak masa kanak-kanak dapat menyembunyikan perbandingan penting sama efektifnya dengan mengirim terlalu sedikit.

## Periksa Ekspor Sebelum Meninggalkan Fasilitas

Buka cakram atau unduhan di komputer yang tidak membuatnya. Set media DICOM biasanya memuat berkas gambar individual dan dapat menyertakan `DICOMDIR`; panduan pasien Standar DICOM menjelaskan bahwa penampil biasanya memuat seluruh pemeriksaan alih-alih satu berkas setiap kali.[4]

Periksa:

- Nama pasien dan pengenal lain
- Tanggal dan waktu pemeriksaan
- Modalitas dan wilayah tubuh
- Jumlah dan nama seri
- Perkiraan jumlah gambar
- Keberadaan fase dengan dan tanpa kontras bila diharapkan
- Apakah irisan tipis, rekonstruksi, atau sekuens fungsional yang diminta peninjau tersedia
- Apakah laporan cocok dengan pemeriksaan yang tepat ini

Gulir dari gambar pertama hingga terakhir pada beberapa seri utama. Folder dapat terbuka normal meskipun separuh pemeriksaan hilang.

Jika beberapa pemeriksaan berbagi satu cakram, buat manifes alih-alih memindahkan berkas internal. Contoh:

| Folder | Pemeriksaan | Tanggal | Laporan | Catatan |
|---|---|---|---|---|
| `01` | CT dada/perut dengan kontras | 2026-01-04 | Ya | Data dasar |
| `02` | CT dada/perut dengan kontras | 2026-03-18 | Ya | Setelah 2 siklus |

## Jangan Mengganti Nama atau Menyunting Berkas DICOM Internal

Sistem DICOM mengidentifikasi pemeriksaan dan seri melalui atribut tertanam dan pengenal unik, bukan nama berkas yang mudah dibaca. Pertahankan struktur ekspor tetap utuh. Ganti nama hanya folder atau arsip terluar, misalnya:

`2026-03-18_CT-chest-abdomen_DICOM`

Jangan membuka gambar dalam perangkat lunak foto lalu menyimpannya kembali. Jangan memangkas, memberi anotasi, atau mengubah data piksel. Jika tenaga klinis memerlukan panah atau catatan, buat tangkapan layar referensi terpisah sambil mempertahankan pemeriksaan tanpa perubahan.

Jika rumah sakit meminta arsip ZIP, kompres folder pemeriksaan tingkat teratas sekali. Hindari beberapa berkas ZIP bersarang kecuali petunjuknya mengharuskannya.

## Unggah Melalui Jalur yang Dikonfirmasi Rumah Sakit

Mintalah:

- Portal atau tautan pemindahan aman yang tepat
- Format yang diterima dan ukuran berkas maksimum
- Apakah arsip harus ZIP, tidak terkompresi, atau kompatibel dengan DICOMweb
- Nomor pasien atau kasus yang harus dimasukkan
- Apakah laporan diunggah secara terpisah
- Kedaluwarsa tautan dan tenggat unggahan
- Kontak dukungan teknis

Aturan rekam medis elektronik Tiongkok mengizinkan institusi medis, bila memiliki kemampuan, menyediakan materi pencitraan atau video secara elektronik dan mewajibkan salinan elektronik dapat dibaca secara mandiri.[5] Itu tidak berarti setiap rumah sakit menggunakan portal yang sama atau dapat mengimpor setiap paket penampil asing.

Unggah dari koneksi yang stabil. Biarkan peramban terbuka sampai platform menunjukkan selesai, lalu simpan tanda terima atau tangkapan layar. Bilah progres yang mencapai 100% mungkin hanya mengonfirmasi pemindahan ke server, bukan impor yang berhasil ke sistem radiologi.

## Lindungi Identitas Pasien Tanpa Merusak Pemeriksaan

Objek DICOM dapat memuat nama pasien, ID, tanggal, dan informasi lain di dalam berkas; mengganti nama berkas tidak menghilangkan identitasnya.[2] Sebagian gambar juga memuat teks yang tertanam pada piksel.

Untuk perawatan klinis langsung, rumah sakit penerima umumnya membutuhkan identitas yang cukup untuk mencocokkan pemeriksaan dengan pasien secara aman. Gunakan jalur dan proses otorisasi yang ditetapkannya.

Untuk penelitian, pengajaran, atau layanan pembacaan kedua tersamar, tanyakan kepada institusi profil penghilangan identitas mana yang diwajibkan dan siapa yang melakukannya. Jangan sembarangan menghapus tag: penghilangan identitas yang buruk dapat meninggalkan informasi pribadi atau menghapus atribut yang diperlukan untuk menghubungkan seri dan membandingkan pemeriksaan.

Undang-Undang Perlindungan Informasi Pribadi Tiongkok memperlakukan informasi kesehatan medis sebagai sensitif dan mewajibkan tujuan spesifik, kebutuhan, serta tindakan perlindungan.[6] Kirim hanya kepada penerima yang teridentifikasi, gunakan masa kedaluwarsa akses bila tersedia, dan jangan memposting tautan pencitraan di ruang publik atau percakapan grup luas.

## Pasangkan Setiap Pemeriksaan dengan Laporan dan Terjemahannya

Beri nama laporan agar tidak terpisah dari gambarnya:

- `2026-03-18_CT-chest-abdomen_report_ORIGINAL.pdf`
- `2026-03-18_CT-chest-abdomen_report_EN-translation.pdf`

Simpan laporan asli meskipun terjemahan Inggris atau Mandarin tersedia. Cantumkan penerjemah dan tanggal. Terjemahan tidak menggantikan penafsiran radiologi baru.

Jika laporan asli diubah, kirim laporan akhir dan semua adendum. Nyatakan versi mana yang dianggap terkini oleh rumah sakit asal.

## Konfirmasikan Impor, Kelengkapan, dan Tinjauan Klinis

Setelah unggahan, mintalah tim penerima mengonfirmasi:

1. Pasien dan kasus yang benar
2. Tanggal pemeriksaan, bagian tubuh, dan modalitas
3. Jumlah pemeriksaan yang diterima
4. Apakah semua seri yang diharapkan telah diimpor
5. Apakah pemeriksaan pembanding sebelumnya ditautkan
6. Nama atau peran radiolog yang menafsirkan
7. Tanggal laporan atau konsultasi yang diharapkan
8. Bagaimana temuan mendesak akan dikomunikasikan

“Berkas diterima” dari koordinator hanyalah langkah pertama. Parameter komunikasi ACR menekankan bahwa informasi pencitraan hanya berguna ketika disampaikan secara tepat waktu kepada pihak yang bertanggung jawab atas keputusan pengobatan.[3]

Tanyakan apakah hasilnya berupa tinjauan multidisiplin informal, laporan pembacaan kedua formal, atau sekadar ketersediaan gambar bagi dokter bedah yang merawat. Produk-produk ini tidak dapat dipertukarkan.

## Kegagalan Pemindahan yang Umum dan Perbaikannya

### Hanya tangkapan layar yang diekspor

Kembali ke fasilitas pencitraan dan mintalah pemeriksaan DICOM lengkap.

### Penampil terbuka tetapi rumah sakit tidak mengimpor apa pun

Temukan folder DICOM mentah atau mintalah ekspor baru berbasis standar. Jangan hanya mengirim berkas eksekutabel penampil.

### ZIP terlalu besar

Mintalah jalur berkapasitas lebih tinggi dari rumah sakit, bagi berdasarkan pemeriksaan lengkap alih-alih jumlah berkas sembarang, atau kirim media fisik terenkripsi. Jangan pernah membuang seri tanpa arahan radiologi.

### Nama atau paspor tidak cocok

Jangan menyunting metadata DICOM sendiri. Berikan pengenal lama dan terkini, lalu mintalah rumah sakit mendokumentasikan kecocokannya saat impor.

### Tautan aman kedaluwarsa

Simpan arsip lokal tanpa perubahan dan mintalah tautan baru. Jangan memindahkan satu-satunya salinan ke portal sementara.

### Pemeriksaan tidak lengkap

Kirim manifes dan uraian seri yang hilang kembali ke fasilitas asal. Unggahan kedua harus diberi label sebagai pengganti atau pelengkap agar peninjau tidak tanpa sadar membaca pemeriksaan parsial.

## Daftar Periksa Akhir Pemindahan

- Pertanyaan klinis dan perbandingan yang diminta dinyatakan
- Pemeriksaan DICOM lengkap diperoleh
- Laporan akhir dan adendum disertakan
- Laporan bahasa asli dipertahankan; terjemahan diberi label
- Pasien, tanggal, modalitas, dan wilayah tubuh yang benar diverifikasi
- Seri dan jumlah gambar yang diharapkan diperiksa
- Struktur folder internal dibiarkan utuh
- Arsip terluar diberi nama jelas dan berhasil dibuka
- Jalur rumah sakit, batas ukuran, dan nomor kasus dikonfirmasi
- Privasi dan izin akses ditinjau
- Tanda terima unggahan disimpan
- Rumah sakit mengonfirmasi impor dan kelengkapan
- Peninjau klinis yang disebutkan namanya dan tanggal respons dicatat

**Penyangkalan medis:** Pemindahan berkas tidak menegakkan diagnosis. Kecukupan gambar, perbandingan, dan implikasi pengobatan harus dinilai oleh tenaga klinis berkualifikasi dengan kasus lengkap. Gejala mendesak memerlukan evaluasi medis setempat dan tidak boleh menunggu unggahan jarak jauh.

## Rumah Sakit Terkait

Sebelum mengirim, verifikasi bahwa rumah sakit tujuan dapat mengimpor pemeriksaan DICOM dari luar, menerima modalitas pemeriksaan, dan menawarkan subspesialisasi radiologi yang dibutuhkan.

## Pengobatan Terkait

Perencanaan operasi, terapi radiasi, tindakan intervensi, penilaian respons kanker, dan tinjauan neurologis atau ortopedi sering memerlukan sekuens, fase, atau perbandingan sebelumnya yang spesifik.

## Related Guides

- [Cara Mengatur Rekam Medis Sebelum Mencari Perawatan di Tiongkok](/id/guides/china-healthcare-guides/how-to-organize-medical-records-before-seeking-care-in-china)
- [Tinjauan Rekam Patologi dan Laboratorium Sebelum Pengobatan di Tiongkok](/id/guides/china-healthcare-guides/pathology-and-laboratory-record-review-before-treatment-in-china)
- [Cara Mempersiapkan Konsultasi Jarak Jauh dengan Dokter di Tiongkok](/id/guides/china-healthcare-guides/how-to-prepare-for-a-remote-consultation-with-a-doctor-in-china)
- [Melindungi Privasi Medis Anda Saat Berbagi Rekam Medis Secara Internasional](/id/guides/china-healthcare-guides/protecting-your-medical-privacy-when-sharing-records-internationally)

## Pertanyaan yang Sering Diajukan

### Bolehkah saya mengirim beberapa tangkapan layar CT melalui email untuk pendapat kedua?

Gambar itu dapat membantu menjelaskan pertanyaan, tetapi tinjauan diagnostik biasanya memerlukan pemeriksaan DICOM lengkap dan laporan yang relevan.[1]

### Apa itu `DICOMDIR`?

Itu adalah indeks yang umum disertakan pada media DICOM untuk membantu perangkat lunak mengidentifikasi pemeriksaan dan berkas. Simpan bersama struktur folder asli.[4]

### Haruskah saya menghapus nama dari berkas DICOM?

Untuk perawatan langsung, ikuti petunjuk pencocokan identitas rumah sakit. Untuk penggunaan tanpa identitas, mintalah layanan berkualifikasi menerapkan profil yang diwajibkan; mengganti nama folder tidak cukup.[2]

### Apakah saya perlu mengirim pemindaian lama?

Kirim perbandingan yang diminta tenaga klinis penerima. Pemeriksaan awal dan yang tepat sebelumnya sering penting, tetapi relevansinya bergantung pada pertanyaan klinis.[3]

### Bagaimana saya tahu rumah sakit benar-benar meninjau gambar?

Tanyakan radiolog atau tim peninjau, bentuk hasil, dan tanggal yang diharapkan. Tanda terima unggahan mengonfirmasi pemindahan, bukan penafsiran.

## SEO Metadata

- **Slug:** `how-to-share-ct-mri-and-other-imaging-files-with-a-chinese-hospital`
- **Meta title:** Bagikan Berkas CT dan MRI ke Rumah Sakit Tiongkok
- **Meta description:** Ekspor pemeriksaan DICOM lengkap, verifikasi seri, lindungi data pasien, serta konfirmasikan impor dan tinjauan radiologi yang berhasil di Tiongkok.
- **Primary keyword:** kirim DICOM ke rumah sakit Tiongkok
- **Pillar keyword:** layanan kesehatan di Tiongkok untuk pasien internasional
- **Vertical keyword:** berbagi berkas CT MRI Tiongkok
- **Search intent:** informasional / persiapan teknis
- **Secondary keywords:** unggah DICOM rumah sakit Tiongkok; pendapat kedua CT Tiongkok; pemindahan berkas MRI Tiongkok

## Sumber

1. [Komite Standar DICOM: Tentang DICOM](https://www.dicomstandard.org/about)
2. [Komite Standar DICOM: Konsep Utama DICOM dan Data Pasien Tertanam](https://www.dicomstandard.org/concepts)
3. [American College of Radiology: Parameter Praktik untuk Komunikasi Temuan Pencitraan Diagnostik](https://www.acr.org/-/media/ACR/Files/Practice-Parameters/communicationdiag.pdf)
4. [Komite Standar DICOM: Menampilkan Gambar Medis dari CD](https://www.dicomstandard.org/using/cds)
5. [Komisi Kesehatan Nasional: Spesifikasi Pengelolaan Penerapan Rekam Medis Elektronik](https://www.nhc.gov.cn/wjw/c100175/201702/90f3de8ae03d488cbddf509dc958f75b.shtml)
6. [Kongres Rakyat Nasional: Undang-Undang Perlindungan Informasi Pribadi Republik Rakyat Tiongkok](https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i)

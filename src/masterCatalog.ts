import { MasterCatalogItem } from './types';

export const INITIAL_MASTER_CATALOG: Omit<MasterCatalogItem, 'id'>[] = [
  // --- HAIs & Surveilans ---
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'HAIs',
    masalah: 'Kejadian CAUTI (Catheter-Associated Urinary Tract Infection)',
    unitTerkait: 'IPD, ICU, Rawat Inap'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'HAIs',
    masalah: 'Kejadian CLABSI (Central Line-Associated Bloodstream Infection)',
    unitTerkait: 'ICU, Rawat Inap, PICU/NICU'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'HAIs',
    masalah: 'Kejadian BSI di hemodialisa',
    unitTerkait: 'Hemodialisa'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'HAIs',
    masalah: 'Kejadian VAP (Ventilator-Associated Pneumonia)',
    unitTerkait: 'ICU, PICU/NICU'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'HAIs',
    masalah: 'Kejadian HAP (Hospital-Acquired Pneumonia)',
    unitTerkait: 'Rawat Inap, ICU'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'HAIs',
    masalah: 'Kejadian SSI (Surgical Site Infection)',
    unitTerkait: 'Kamar Operasi (OT), Rawat Inap Bedah'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Surveilans',
    masalah: 'ISK (Infeksi Saluran Kemih)',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Surveilans',
    masalah: 'Plebhitis pada pemasangan kanula intravena perifer',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Surveilans',
    masalah: 'Outbreak (wabah) penyakit infeksi di rumah sakit',
    unitTerkait: 'Seluruh Departemen'
  },

  // --- Bundles HAIs ---
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Bundle HAIs',
    masalah: 'Ketidakpatuhan Pelaksanaan Bundles CAUTI',
    unitTerkait: 'Rawat Inap, ICU'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Bundle HAIs',
    masalah: 'Ketidakpatuhan Pelaksanaan Bundles CLABSI',
    unitTerkait: 'ICU, Rawat Inap'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Bundle HAIs',
    masalah: 'Ketidakpatuhan Pelaksanaan Bundle VAP',
    unitTerkait: 'ICU'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Bundle HAIs',
    masalah: 'Ketidakpatuhan Pelaksanaan Bundle SSI',
    unitTerkait: 'Kamar Operasi, Bedah'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Bundle HAIs',
    masalah: 'BUNDLE IADP belum optimal dilaksanakan',
    unitTerkait: 'ICU, Rawat Inap'
  },

  // --- MDRO ---
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'MDRO',
    masalah: 'Kasus HA MDRO (Hospital-Acquired Multi-Drug Resistant Organisms)',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'MDRO',
    masalah: 'Ketidakpatuhan pelaksanaan skrining MRSA',
    unitTerkait: 'ICU, Ruang Isolasi'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'MDRO',
    masalah: 'CA-MRSA pada pasien rawat',
    unitTerkait: 'Rawat Inap, Poliklinik'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'MDRO',
    masalah: 'HA-MDRO spesimen positif di ruang perawatan',
    unitTerkait: 'Laboratorium, Rawat Inap'
  },

  // --- Emerging - Reemerging Disease ---
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Emerging - Reemerging Disease',
    masalah: 'Kasus baru Pandemic Covid-19 / Infeksi Menular Baru',
    unitTerkait: 'Emergency, Rawat Inap, Isolasi'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Emerging - Reemerging Disease',
    masalah: 'Staff Terpapar Covid-19 / Penyakit Infeksi Menular',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Emerging - Reemerging Disease',
    masalah: 'Kurangnya ketersediaan Fasilitas penunjang penatalaksanaan COVID',
    unitTerkait: 'Fasilitas, Logistik'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Emerging - Reemerging Disease',
    masalah: 'Kurangnya pengetahuan staff terkait penatalaksanaan covid 19',
    unitTerkait: 'Diklat, Staf Medis'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Emerging - Reemerging Disease',
    masalah: 'Ketidakpatuhan petugas melakukan protokol kesehatan',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Belum tersedianya alur pelayanan pasien Covid-19',
    unitTerkait: 'Emergency, OPD'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Kurangnya fasilitas APD Covid -19',
    unitTerkait: 'Logistik, Farmasi'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Kurangnya kepatuhan memakai dan melepas APD Covid -19',
    unitTerkait: 'Rawat Inap, Isolasi'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Kurangnya fasilitas Ruang Isolasi Covid-19 bertekanan negatif',
    unitTerkait: 'Fasilitas, Isolasi'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Kurangnya kepatuhan penanganan Limbah Covid -19',
    unitTerkait: 'Limbah B3'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Kurangnya kepatuhan pengelolaan Linen Covid -19',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
    subgrup: 'Covid-19',
    masalah: 'Kurangnya kepatuhan Desinfeksi, Dekontaminasi dan Sterilisasi Peralatan ambulance',
    unitTerkait: 'Ambulance, Emergency'
  },

  // --- Laboratorium ---
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Laboratorium',
    masalah: 'Pembuangan darah dan komponen darah belum sesuai prosedur',
    unitTerkait: 'Laboratorium'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Laboratorium',
    masalah: 'Pembuangan jarum suntik bekas dan benda tajam lainnya belum sesuai prosedur (tidak kedalam sharpbox)',
    unitTerkait: 'Laboratorium'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Laboratorium',
    masalah: 'Tumpahan sampel pemeriksaan di area kerja laboratorium',
    unitTerkait: 'Laboratorium'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Laboratorium',
    masalah: 'Pencegahan tertusuk jarum saat flebotomi belum berjalan optimal',
    unitTerkait: 'Laboratorium'
  },

  // --- Ruangan Operasi (OT) ---
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Ruangan Operasi',
    masalah: 'Kebersihan lingkungan OT – lantai, dinding, plafon, meja, lampu operasi',
    unitTerkait: 'Kamar Operasi (OT)'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Ruangan Operasi',
    masalah: 'Kualitas udara/HVAC – tekanan positif, ACH, suhu, kelembapan, filter HEPA',
    unitTerkait: 'Kamar Operasi (OT)'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Ruangan Operasi',
    masalah: 'Hand hygiene & APD – kepatuhan petugas dan surgical attire di OT',
    unitTerkait: 'Kamar Operasi (OT)'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Ruangan Operasi',
    masalah: 'SSI prevention bundle – skin preparation, antibiotic prophylaxis, asepsis',
    unitTerkait: 'Kamar Operasi (OT)'
  },

  // --- ICU & Perawatan Intensif ---
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'ICU',
    masalah: 'Kebersihan lingkungan – lantai, permukaan, bed, dan high-touch area di ICU',
    unitTerkait: 'ICU, PICU/NICU'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Perawatan pasien infeksius',
    masalah: 'Perawatan pasien MDRO tidak sesuai prosedur kewaspadaan transmisi',
    unitTerkait: 'ICU, Rawat Inap'
  },

  // --- Ruang Isolasi & Penempatan Pasien ---
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Isolasi (Penempatan pasien)',
    masalah: 'Airborne precaution tidak sesuai prosedur',
    unitTerkait: 'Isolasi, Rawat Inap'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Isolasi (Penempatan pasien)',
    masalah: 'Droplet precaution tidak sesuai prosedur',
    unitTerkait: 'Isolasi, Rawat Inap'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Isolasi (Penempatan pasien)',
    masalah: 'Contact precaution tidak sesuai prosedur',
    unitTerkait: 'Isolasi, Rawat Inap'
  },

  // --- Hemodialisa (HD) ---
  {
    grup: 'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
    subgrup: 'HD',
    masalah: 'Pemisahan pasien infeksius dan non infeksius tidak dilaksanakan sesuai prosedur',
    unitTerkait: 'Hemodialisa'
  },
  {
    grup: 'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
    subgrup: 'HD',
    masalah: 'Terjadi kontaminasi water treatment hemodialisa / endotoksin tinggi',
    unitTerkait: 'Hemodialisa'
  },

  // --- Dental ---
  {
    grup: 'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
    subgrup: 'Dental',
    masalah: 'Dental waterline tidak dilakukan treatment desinfeksi rutin',
    unitTerkait: 'Dental'
  },
  {
    grup: 'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
    subgrup: 'Dental',
    masalah: 'Dental Handpiece tidak dilakukan pembersihan dan sterilisasi antar pasien',
    unitTerkait: 'Dental'
  },

  // --- Endoskopi ---
  {
    grup: 'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
    subgrup: 'Endoskopi',
    masalah: 'Proses pencucian endoskop tidak optimal (pre-cleaning & leak test)',
    unitTerkait: 'Endoskopi'
  },
  {
    grup: 'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
    subgrup: 'Endoskopi',
    masalah: 'Penyimpanan endoskop tidak sesuai standar (gantung vertikal berventilasi)',
    unitTerkait: 'Endoskopi'
  },

  // --- Aseptik & Tindakan Berisiko Tinggi ---
  {
    grup: 'Prosedur/tindakan-tindakan berisiko tinggi',
    subgrup: 'Aseptik teknik',
    masalah: 'Teknik aseptik Pemberian obat IV tidak dilakukan secara optimal',
    unitTerkait: 'Rawat Inap, ICU, IGD'
  },
  {
    grup: 'Prosedur/tindakan-tindakan berisiko tinggi',
    subgrup: 'Aseptik teknik',
    masalah: 'Peralatan yang digunakan untuk prosedur invasif tidak steril',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Prosedur/tindakan-tindakan berisiko tinggi',
    subgrup: 'Aseptik teknik',
    masalah: 'Cairan yang digunakan kadaluarsa atau melebihi batas beyond-use date',
    unitTerkait: 'Farmasi, Rawat Inap'
  },
  {
    grup: 'Prosedur/tindakan-tindakan berisiko tinggi',
    subgrup: 'Aseptik teknik',
    masalah: 'Pencampuran obat tidak dilakukan di ruang obat steril (clean utility)',
    unitTerkait: 'Rawat Inap, Farmasi'
  },
  {
    grup: 'Prosedur/tindakan-tindakan berisiko tinggi',
    subgrup: 'Aseptik teknik',
    masalah: 'Perawat memasang infus > 2 kali penusukan tanpa ganti set',
    unitTerkait: 'Rawat Inap, IGD'
  },

  // --- Linen & Laundry ---
  {
    grup: 'Pelayanan distribusi linen bersih dan kotor',
    subgrup: 'Linen',
    masalah: 'Terlambatnya kedatangan distribusi linen bersih di ruangan',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pelayanan distribusi linen bersih dan kotor',
    subgrup: 'Linen',
    masalah: 'Penanganan linen bersih tidak sesuai prosedur (terbuka/terkontaminasi)',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pelayanan distribusi linen bersih dan kotor',
    subgrup: 'Linen',
    masalah: 'Penyimpanan linen bersih tidak sesuai prosedur (lemari tertutup & kelembaban)',
    unitTerkait: 'Rawat Inap, Linen'
  },
  {
    grup: 'Pelayanan distribusi linen bersih dan kotor',
    subgrup: 'Linen',
    masalah: 'Troley linen kotor tidak tertutup rapat saat transportasi',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pelayanan distribusi linen bersih dan kotor',
    subgrup: 'Linen',
    masalah: 'Linen kotor tidak diletakkan pada tempatnya / diletakkan di lantai',
    unitTerkait: 'Rawat Inap'
  },
  {
    grup: 'Pengelolaan linen/laundri',
    subgrup: 'Laundry',
    masalah: 'Proses pencucian linen tidak optimal (masih ada noda atau bau)',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pengelolaan linen/laundri',
    subgrup: 'Laundry',
    masalah: 'Linen infeksius dan noninfeksius tidak ada pemisahan kantung infeksius',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pengelolaan linen/laundri',
    subgrup: 'Laundry',
    masalah: 'Penyimpanan linen belum sesuai standar suhu dan kelembaban',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pengelolaan linen/laundri',
    subgrup: 'Laundry',
    masalah: 'Alur linen bersih dan kotor bercampur tanpa barrier fisik',
    unitTerkait: 'Linen dan laundry'
  },
  {
    grup: 'Pengelolaan linen/laundri',
    subgrup: 'Laundry',
    masalah: 'Petugas laundry tidak menggunakan APD lengkap saat pemilahan linen kotor',
    unitTerkait: 'Linen dan laundry'
  },

  // --- CSSD (Sterilisasi Alat) ---
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Pembersihan desinfeksi dan sterilisasi alat tidak optimal',
    unitTerkait: 'CSSD'
  },
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Proses pengeringan instrumen tidak optimal sebelum pengemasan',
    unitTerkait: 'CSSD'
  },
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Penanganan SUDs / alat yang diproses ulang tidak optimal dilakukan',
    unitTerkait: 'CSSD'
  },
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Rak Penyimpanan alat steril kurang bersih dan tidak berjarak dari dinding/lantai',
    unitTerkait: 'CSSD'
  },
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Penggunaan alat reuse melewati batas yang ditentukan pedoman',
    unitTerkait: 'CSSD'
  },
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Peralatan yang kadarluarsa masa sterilnya',
    unitTerkait: 'CSSD, Kamar Operasi'
  },
  {
    grup: 'Pelayanan sterilisasi alat',
    subgrup: 'CSSD',
    masalah: 'Tersedia lemari berkunci untuk penyimpanan peralatan yang sensitif',
    unitTerkait: 'CSSD'
  },

  // --- Kebersihan Permukaan & Lingkungan ---
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Kebersihan',
    masalah: 'Kebersihan lingkungan tidak optimal (debu, sisa tempelan, karat)',
    unitTerkait: 'Housekeeping, Seluruh Departemen'
  },
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Kebersihan',
    masalah: 'Kerapihan ruangan perawatan kurang optimal',
    unitTerkait: 'Rawat Inap, OPD'
  },
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Kebersihan',
    masalah: 'Fasilitas peralatan kebersihan (mop/kain pel) tidak dilakukan pencucian & desinfeksi rutin',
    unitTerkait: 'Housekeeping'
  },
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Kebersihan',
    masalah: 'Pembersihan bed pasien tidak dilakukan optimal saat discharge',
    unitTerkait: 'Rawat Inap, Housekeeping'
  },
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Kebersihan',
    masalah: 'Alat medis tidak dilakukan pembersihan dan desinfeksi antar pasien',
    unitTerkait: 'Seluruh Departemen'
  },

  // --- Pengelolaan Sampah / Limbah B3 ---
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah',
    masalah: 'Ketidakpatuhan pemilahan pembuangan limbah domestik dan infeksius',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah',
    masalah: 'Tempat sampah terbuka / injakan pedal rusak sehingga disentuh tangan',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah',
    masalah: 'Limbah tidak segera diangkut / menumpuk melebihi kapasitas',
    unitTerkait: 'Housekeeping, Limbah B3'
  },
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah',
    masalah: 'Limbah benda tajam di sharp container terisi lebih dari 3/4 bagian',
    unitTerkait: 'Rawat Inap, IGD, Laboratorium'
  },
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah B3',
    masalah: 'Keterlambatan pengangkutan limbah medis oleh pihak ketiga berizin',
    unitTerkait: 'Limbah B3, TPS'
  },
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah B3',
    masalah: 'Belum dilakukan desinfeksi rutin di area TPS B3',
    unitTerkait: 'Limbah B3, TPS'
  },
  {
    grup: 'Pengelolaan sampah',
    subgrup: 'Limbah B3',
    masalah: 'Belum tersedia SOP eye wash dan body wash di TPS B3',
    unitTerkait: 'Limbah B3, K3RS'
  },

  // --- Penyediaan Makanan / Food Safety ---
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Pencucian bahan makanan mentah (sayur/buah/daging) tidak optimal',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Pencucian peralatan makan pasien tidak optimal suhu dan desinfektan',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Pencucian peralatan memasak dapur tidak optimal',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Penyimpanan bahan makanan tidak menggunakan sistem FIFO / FEFO',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Kontaminasi silang makanan / ditemukan benda asing pada makanan matang',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Suhu HOT trolley untuk distribusi makanan pasien tidak sesuai standar (>60°C)',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Suhu chiller / freezer penyimpanan bahan makanan tidak sesuai standar',
    unitTerkait: 'Kitchen / Gizi'
  },
  {
    grup: 'Penyediaan makanan',
    subgrup: 'Food safety',
    masalah: 'Adanya serangga atau hama di area dapur (kecoa, lalat, semut)',
    unitTerkait: 'Kitchen / Gizi'
  },

  // --- Pengelolaan Kamar Jenazah (Mortuary) ---
  {
    grup: 'Pengelolaan kamar jenazah',
    subgrup: 'Mortuary',
    masalah: 'Penanganan jenazah infeksius tidak sesuai dengan prosedur PPI',
    unitTerkait: 'Mortuary'
  },
  {
    grup: 'Pengelolaan kamar jenazah',
    subgrup: 'Mortuary',
    masalah: 'Petugas mortuary terpapar percikan cairan tubuh jenazah',
    unitTerkait: 'Mortuary'
  },
  {
    grup: 'Pengelolaan kamar jenazah',
    subgrup: 'Mortuary',
    masalah: 'Ketersediaan APD khusus kamar jenazah tidak lengkap',
    unitTerkait: 'Mortuary'
  },
  {
    grup: 'Pengelolaan kamar jenazah',
    subgrup: 'Mortuary',
    masalah: 'Ketidaksesuaian fasilitas denah dan ventilasi ruang mortuary',
    unitTerkait: 'Mortuary, Fasilitas'
  },

  // --- Kegagalan Tindakan Pencegahan (Hand Hygiene & APD) ---
  {
    grup: 'Kegagalan tindakan pencegahan',
    subgrup: 'Hand hygiene',
    masalah: 'Ketidakpatuhan pelaksanaan hand hygiene 5 momen dengan teknik benar',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Kegagalan tindakan pencegahan',
    subgrup: 'Hand hygiene',
    masalah: 'Sarana hand hygiene (handrub/sabun/tisu) tidak lengkap atau kosong di titik poin',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Kegagalan tindakan pencegahan',
    subgrup: 'APD',
    masalah: 'Ketidakpatuhan penggunaan APD sesuai indikasi risiko transmisi',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Kegagalan tindakan pencegahan',
    subgrup: 'APD',
    masalah: 'Ketersediaan APD tidak lengkap atau stok habis',
    unitTerkait: 'Farmasi, Logistik'
  },
  {
    grup: 'Kegagalan tindakan pencegahan',
    subgrup: 'Kesehatan Karyawan',
    masalah: 'Kejadian Needle Stick Injury / tertusuk jarum suntik bekas',
    unitTerkait: 'Seluruh Departemen'
  },

  // --- Renovasi & Konstruksi ---
  {
    grup: 'Renovasi dan konstruksi',
    subgrup: 'Renovasi',
    masalah: 'Perencanaan ICRA / PCRA konstruksi renovasi yang tidak efektif',
    unitTerkait: 'Facility Management, Renovasi'
  },
  {
    grup: 'Renovasi dan konstruksi',
    subgrup: 'Renovasi',
    masalah: 'Debu renovasi menyebar ke area rawat pasien karena barrier barrier jebol',
    unitTerkait: 'Facility Management, Renovasi'
  },

  // --- Edukasi Staf & Pasien ---
  {
    grup: 'Edukasi staff, pasien dan pengunjung',
    subgrup: 'Edukasi staff',
    masalah: 'Kurangnya pendidikan dan pelatihan berkala staff terkait PPI',
    unitTerkait: 'Diklat, Komite PPI'
  },
  {
    grup: 'Edukasi staff, pasien dan pengunjung',
    subgrup: 'Edukasi pasien dan pengunjung',
    masalah: 'Kurangnya edukasi kebersihan tangan dan etika batuk bagi pasien & pengunjung',
    unitTerkait: 'PKRS, Rawat Jalan, Rawat Inap'
  },

  // --- Fasilitas & Lingkungan Rumah Sakit ---
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Fasilitas',
    masalah: 'Ketersediaan fasilitas cuci tangan, APD, sharp container, dan tempat sampah kurang',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Fasilitas',
    masalah: 'Kebersihan peralatan perawatan pasien kurang adekuat',
    unitTerkait: 'Rawat Inap, ICU'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Fasilitas',
    masalah: 'Risiko infeksi yang terkait dengan pemrosesan alat sekali pakai',
    unitTerkait: 'CSSD, Kamar Operasi'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Fasilitas',
    masalah: 'Pengawasan terhadap penggunaan antimikroba yang belum sesuai (PPRA)',
    unitTerkait: 'Farmasi, Komite Medik'
  },
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Lingkungan RS',
    masalah: 'Infeksi dari kontaminasi air baku rumah sakit',
    unitTerkait: 'Facility Management'
  },
  {
    grup: 'Kebersihan permukaan dan lingkungan',
    subgrup: 'Lingkungan RS',
    masalah: 'Infeksi dari sistem ventilasi dan sirkulasi AC yang tidak rutin dirawat',
    unitTerkait: 'Facility Management'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Komunikasi',
    masalah: 'Komunikasi staf unit dengan ICLN kurang efektif',
    unitTerkait: 'Seluruh Departemen'
  },
  {
    grup: 'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
    subgrup: 'Komunikasi',
    masalah: 'Komunikasi ICLN dengan IPCN kurang intensif dalam pelaporan surveilans',
    unitTerkait: 'Komite PPI'
  }
];

export function getInitialMasterCatalog(): MasterCatalogItem[] {
  return INITIAL_MASTER_CATALOG.map((item, index) => ({
    ...item,
    id: `cat-${index + 1}-${Math.random().toString(36).slice(2, 7)}`
  }));
}

export interface DomainItem {
  key: string;
  name: string;
  desc: string;
  iconName: string;
  items: string[];
  tips: string[];
}

export const DOMAINS: DomainItem[] = [
  {
    key: 'interest',
    name: 'Minat & Eksplorasi Karier',
    desc: 'Ketertarikan aktivitas dan ragam bidang karier yang ingin dipelajari',
    iconName: 'Compass',
    items: [
      'Saya senang mencari tahu bagaimana suatu pekerjaan dilakukan di dunia nyata.',
      'Saya tertarik mencoba bidang yang belum pernah saya pelajari sebelumnya.',
      'Saya dapat membayangkan beberapa pilihan pendidikan atau karier masa depan yang menarik.',
      'Saya aktif mencari informasi tentang bidang keahlian yang membuat saya penasaran.',
      'Saya menikmati kegiatan yang memberi kesempatan luas mempelajari hal-hal baru.',
      'Saya ingin mencoba pengalaman praktik langsung sebelum menentukan pilihan bidang tertentu.'
    ],
    tips: [
      'Lakukan wawancara singkat atau observasi tentang profesi yang paling membuat penasaran.',
      'Coba ikuti dua kegiatan workshop/proyek dari bidang berbeda lalu refleksikan kesannya.'
    ]
  },
  {
    key: 'reasoning',
    name: 'Penalaran & Belajar',
    desc: 'Cara memahami permasalahan logis, analisa data, dan strategi belajar',
    iconName: 'Brain',
    items: [
      'Saya menikmati memecahkan masalah rumit secara bertahap dan sistematis.',
      'Saya senang mencari pola, logika sebab-akibat, atau hubungan dari berbagai informasi.',
      'Saya mencoba metode alternatif ketika strategi pertama belum berhasil memecahkan masalah.',
      'Saya dapat menjelaskan alasan rasional di balik jawaban atau keputusan yang saya buat.',
      'Saya membandingkan beberapa sumber terpercaya sebelum menyimpulkan suatu perkara.',
      'Saya berusaha memahami konsep dasar secara mendalam, bukan sekadar menghafal jawaban.'
    ],
    tips: [
      'Berikan tantangan pemecahan masalah bertahap dengan umpan balik konstruktif.',
      'Catat proses penalaran dan logika yang digunakan dalam jurnal belajar, bukan hanya hasil akhir.'
    ]
  },
  {
    key: 'practical',
    name: 'Teknis & Praktis',
    desc: 'Keterampilan membuat, merakit, mengoperasikan, dan memperbaiki alat/sistem',
    iconName: 'Wrench',
    items: [
      'Saya tertarik membuat, merakit, atau memperbaiki sesuatu dengan tangan secara langsung.',
      'Saya senang belajar mengoperasikan alat, perangkat mekanik/digital, atau teknologi baru.',
      'Saya teliti mengikuti prosedur langkah kerja untuk menghasilkan produk yang presisi.',
      'Saya menikmati kegiatan praktik nyata yang menghasilkan wujud solusi fungsional.',
      'Saya terbiasa mencari akar penyebab ketika suatu alat atau proses tidak berjalan semestinya.',
      'Saya selalu memperhatikan standar keselamatan dan ketelitian saat bekerja praktik.'
    ],
    tips: [
      'Buat proyek praktik terapan sederhana dan evaluasi dengan rubrik kualitas kerja.',
      'Sediakan kesempatan eksplorasi alat lab, software teknik, atau perkakas langsung.'
    ]
  },
  {
    key: 'creative',
    name: 'Kreativitas & Ekspresi',
    desc: 'Pengembangan ide orisinal, estetika, desain, dan ekspresi ragam media',
    iconName: 'Palette',
    items: [
      'Saya sering memikirkan cara baru atau unik untuk menyelesaikan tugas yang biasa.',
      'Saya menikmati membuat karya seni, desain visual, tulisan cerita, atau konten kreatif.',
      'Saya senang mengembangkan ide mentah menjadi bentuk nyata yang dapat diapresiasi orang lain.',
      'Saya tertarik menggabungkan inspirasi dari berbagai sumber menjadi karya yang segar.',
      'Saya mencoba membuat lebih dari satu alternatif rancangan sebelum memilih hasil terbaik.',
      'Saya menikmati menyampaikan pesan atau gagasan melalui media visual, audio, atau narasi.'
    ],
    tips: [
      'Beri ruang berkarya dengan brief terbuka dan minta siswa mempresentasikan alur idenya.',
      'Dokumentasikan portofolio proses dari sketsa kasar hingga karya final untuk melihat lompatan ide.'
    ]
  },
  {
    key: 'social',
    name: 'Interpersonal & Kolaborasi',
    desc: 'Komunikasi empatik, keterbukaan sudut pandang, dan kerja sama tim',
    iconName: 'Users',
    items: [
      'Saya berusaha mendengarkan dan memahami sudut pandang teman yang berbeda pendapat.',
      'Saya merasa nyaman dan produktif bekerja sama dalam tim untuk mencapai target bersama.',
      'Saya dapat menyampaikan pemikiran dan instruksi dengan bahasa yang santun dan mudah dipahami.',
      'Saya terbiasa mendengarkan dengan penuh perhatian sebelum buru-buru memberi tanggapan.',
      'Saya berusaha membantu meredakan ketegangan dan mencari jalan tengah saat ada perselisihan.',
      'Saya dapat menyesuaikan gaya komunikasi dengan berbagai karakter orang atau suasana.'
    ],
    tips: [
      'Libatkan dalam kerja tim berskala dinamis dengan rotasi peran anggota.',
      'Latih keterampilan mediasi dan fasilitasi dialog melalui studi kasus kelompok.'
    ]
  },
  {
    key: 'leadership',
    name: 'Kepemimpinan & Inisiatif',
    desc: 'Kemampuan menggerakkan rekan, mengorganisasi agenda, dan mengambil tanggung jawab',
    iconName: 'Crown',
    items: [
      'Saya bersedia mengambil tanggung jawab kepemimpinan ketika organisasi/kelompok membutuhkannya.',
      'Saya dapat memandu kelompok menyepakati prioritas dan langkah tindakan berikutnya.',
      'Saya berani mengajukan inisiatif baru yang membawa manfaat bagi lingkungan sekolah/rekan.',
      'Saya berusaha memastikan pembagian peran tim dilakukan secara adil dan terarah.',
      'Saya berani mengambil keputusan sulit setelah mempertimbangkan saran rekan dan pembimbing.',
      'Saya terbiasa mengevaluasi jalannya kegiatan untuk memetik pembelajaran bagi tim ke depan.'
    ],
    tips: [
      'Beri kepercayaan memegang kepanitiaan atau koordinator kegiatan kecil.',
      'Adakan sesi evaluasi reflektif mengenai gaya kepemimpinan dan manajemen tim.'
    ]
  },
  {
    key: 'self',
    name: 'Pengelolaan Diri & Ketekunan',
    desc: 'Manajemen waktu, determinasi menghadapi kesulitan, dan refleksi berkala',
    iconName: 'CheckCircle2',
    items: [
      'Saya mampu memecah rencana besar menjadi target-target kecil yang teratur dikerjakan.',
      'Saya tetap gigih berusaha menyelesaikan tanggung jawab meski menghadapi kendala rumit.',
      'Saya menyambut kritik dan umpan balik sebagai sarana penting untuk menyempurnakan diri.',
      'Saya disiplin mengatur jadwal belajar dan istirahat agar tugas tuntas sebelum tenggat.',
      'Saya dapat memetakan kelebihan diri sendiri serta aspek yang masih butuh latihan lebih keras.',
      'Saya cepat bangkit dan kembali mencoba saat menemui kegagalan atau hasil yang belum memuaskan.'
    ],
    tips: [
      'Susun tabel target mingguan terukur dan lakukan review kemajuan mandiri setiap akhir pekan.',
      'Latih kebiasaan time-blocking dan teknik refleksi diri atas tantangan yang dihadapi.'
    ]
  },
  {
    key: 'aspiration',
    name: 'Aspirasi & Kesiapan Berkembang',
    desc: 'Kejelasan cita-cita, keterbukaan pada saran, dan dorongan belajar berkelanjutan',
    iconName: 'Target',
    items: [
      'Saya memiliki gambaran cita-cita atau bidang keilmuan yang ingin saya dalami di jenjang lanjut.',
      'Saya antusias mencoba kegiatan positif di luar kurikulum wajib untuk menguji minat saya.',
      'Saya dapat merumuskan keterampilan kunci yang harus saya kuasai demi cita-cita saya.',
      'Saya proaktif mencari peluang pelatihan, kompetisi, atau komunitas belajar mandiri.',
      'Saya terbuka berdiskusi meminta saran dari guru BK, orang tua, dan profesional tentang masa depan.',
      'Saya siap menetapkan langkah aksi nyata yang konsisten untuk mendekatkan diri pada cita-cita.'
    ],
    tips: [
      'Susun peta jalan karier (Career Road Map) 3 tahun ke depan bersama konselor BK.',
      'Ikuti kegiatan career day, webinar industri, atau interaksi langsung dengan praktisi di bidang terkait.'
    ]
  }
];

export function getScoreInterpretation(score: number): { label: string; badgeClass: string; desc: string } {
  if (score >= 4.2) {
    return {
      label: 'Sangat Menonjol',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Potensi respon diri sangat kuat dan konsisten. Sangat direkomendasikan menjadi prioritas eksplorasi lanjutan.'
    };
  }
  if (score >= 3.5) {
    return {
      label: 'Ketertarikan Tinggi',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Menunjukkan kecenderungan minat yang baik. Perlu triangulasi dengan portofolio dan pengalaman langsung.'
    };
  }
  if (score >= 2.6) {
    return {
      label: 'Perlu Eksplorasi',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      desc: 'Belum cukup tereksplorasi atau baru tahap pengenalan. Beri kesempatan mencoba pengalaman baru.'
    };
  }
  return {
    label: 'Belum Menjadi Fokus',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
    desc: 'Saat ini belum menjadi prioritas minat siswa. Dapat berkembang seiring pertambahan wawasan dan usia.'
  };
}

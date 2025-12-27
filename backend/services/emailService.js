const nodemailer = require('nodemailer');


// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use App Password, not regular password
    }
  });
};

const sendResetPasswordEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    // URL Frontend
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const mailOptions = {
      from: `"Kamus Mahasiswa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password - Kamus Mahasiswa',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Reset Password</h1>
          </div>
          
          <div style="padding: 35px; background: #f8fafc;">
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              
              <p style="color: #475569; margin: 0 0 15px 0;">Halo <strong>${userName || 'User'}</strong>,</p>
              
              <p style="color: #475569; line-height: 1.6;">
                Kami menerima permintaan untuk mereset password akun Kamus Mahasiswa Anda. Jika Anda merasa tidak memintanya, silakan abaikan email ini.
              </p>

              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e293b; font-weight: bold;">Penting:</p>
                <p style="margin: 5px 0 0 0; color: #475569; font-style: italic;">
                  Link ini hanya berlaku selama <strong>1 jam</strong> demi keamanan akun Anda.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  🔒 Reset Password Saya
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                Jika tombol di atas tidak berfungsi, salin dan tempel link berikut di browser Anda:<br>
                <span style="color: #3b82f6;">${resetUrl}</span>
              </p>

            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent to:', email);
    
    return { success: true };

  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Gagal mengirim email reset password');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    // Check if email is properly configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com' || 
        !process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your-app-password') {
      console.log('⚠️  Email not configured. Welcome email for:', email);
      return { 
        success: true, 
        messageId: 'dev-mode',
        message: 'Email not configured - running in development mode.'
      };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Kamus Mahasiswa" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: email,
      subject: 'Selamat Datang di Kamus Mahasiswa! 🎓',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header dengan Logo Kamus Mahasiswa -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 25px; text-align: center; position: relative;">
            <div style="background: white; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <div style="font-size: 32px; font-weight: bold; color: #1e40af; text-align: center; line-height: 1;">
                📚<br><span style="font-size: 8px; display: block; margin-top: -2px;">MAHASISWA</span>
              </div>
            </div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Kamus Mahasiswa</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Portal Berita & Informasi Kampus</p>
          </div>
          
          <div style="padding: 35px; background: #f8fafc;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #1e293b; margin: 0; font-size: 22px; font-weight: 600;">🎉 Selamat Datang!</h2>
              <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">Halo, <strong>${userName}</strong>!</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px;">
              <p style="color: #475569; line-height: 1.7; margin: 0 0 20px 0; font-size: 15px; text-align: center;">
                🎓 <strong>Selamat bergabung di Kamus Mahasiswa!</strong><br>
                Akun Anda telah berhasil dibuat dan siap digunakan.
              </p>
              
              <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">🚀 Fitur yang dapat Anda nikmati:</h3>
                <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>📰 Berita Terkini</strong> - Dapatkan informasi terbaru dari kampus</li>
                  <li><strong>💾 Simpan Artikel</strong> - Koleksi artikel favorit untuk dibaca nanti</li>
                  <li><strong>👥 Ikuti Penulis</strong> - Follow penulis favorit Anda</li>
                  <li><strong>💬 Diskusi Interaktif</strong> - Berpartisipasi dalam diskusi menarik</li>
                  <li><strong>🔔 Notifikasi</strong> - Dapatkan notifikasi artikel terbaru</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                   style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
                          color: white; 
                          padding: 16px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: 600;
                          font-size: 15px;
                          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                  🎯 Mulai Jelajahi Kamus Mahasiswa
                </a>
              </div>
              
              <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5;">
                  <strong>💡 Tips untuk Anda:</strong><br>
                  • Lengkapi profil Anda untuk pengalaman yang lebih personal<br>
                  • Aktifkan notifikasi untuk tidak ketinggalan berita terbaru<br>
                  • Ikuti topik yang Anda minati untuk konten yang relevan
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
              <p style="color: #64748b; margin: 0; font-size: 13px; line-height: 1.5;">
                <strong>Ada pertanyaan?</strong> Tim support kami siap membantu di <a href="mailto:support@kamusammahasiswa.com" style="color: #3b82f6;">support@kamusammahasiswa.com</a>
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0; color: #94a3b8;">© 2025 Kamus Mahasiswa - Portal Berita & Informasi Kampus</p>
            <p style="margin: 8px 0 0 0; color: #64748b;">Selamat mengeksplorasi dunia kampus bersama kami!</p>
            <div style="margin-top: 15px;">
              <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Kebijakan Privasi</a>
              <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Syarat & Ketentuan</a>
              <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Bantuan</a>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Helper untuk URL Avatar (Pastikan Anda punya env variabel BACKEND_URL, atau ganti hardcode domain)
const getAvatarUrl = (avatarPath, name) => {
  if (!avatarPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }
  if (avatarPath.startsWith('http')) return avatarPath;
  // Ubah localhost:5000 sesuai domain backend production Anda nanti
  const baseUrl = 'http://localhost:5000'; 
  console.log(`${baseUrl}${avatarPath}`);
  return `${baseUrl}${avatarPath}`;
};

const senderCardHtml = (name, email, avatar, roleLabel) => `
  <div style="text-align: center; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 11px; font-weight: 700; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">
      ${roleLabel}
    </p>
    <div style="display: inline-block; padding: 3px; border: 2px solid #e2e8f0; border-radius: 50%;">
      <img src="${getAvatarUrl(avatar, name)}" alt="${name}" 
           style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; display: block;">
    </div>
    <h3 style="color: #1e293b; margin: 10px 0 2px 0; font-size: 16px; font-weight: 600;">${name}</h3>
    <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">${email}</a>
  </div>
`;

const sendDraftReviewNotification = async (editorEmail, editorName, articleTitle, authorName, articleId,senderData) => {
  try {
    // Check config
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email not configured. Draft notification for:', editorEmail);
      return { success: true, messageId: 'dev-mode' };
    }

    const senderCard = senderData ? senderCardHtml(senderData.name, senderData.email, senderData.avatar, 'Dikirim Oleh Penulis') : '';

    const transporter = createTransporter();
    const reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/article/${articleId}`;
    
    const mailOptions = {
      from: `"Kamus Mahasiswa" <${process.env.EMAIL_USER}>`,
      to: editorEmail,
      subject: `📝 Butuh Review: Draft Baru dari ${authorName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Draft Baru Masuk</h1>
          </div>
          
          ${senderCard}
          <div style="padding: 35px; background: #f8fafc;">
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <p style="color: #475569; margin: 0 0 15px 0;">Halo <strong>${editorName}</strong>,</p>
              
              <p style="color: #475569; line-height: 1.6;">
                <strong>${authorName}</strong>, baru saja membuat draft artikel baru yang memerlukan tinjauan Anda sebelum dipublikasikan.
              </p>

              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e293b; font-weight: bold;">Judul Artikel:</p>
                <p style="margin: 5px 0 0 0; color: #475569; font-style: italic;">"${articleTitle}"</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${reviewLink}" 
                   style="background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  🔍 Review Artikel
                </a>
              </div>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Review email sent to ${editorName} (${editorEmail})`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Draft notification failed:', error);
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Kamus Mahasiswa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifikasi Akun - Kamus Mahasiswa',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Selamat Datang!</h1>
          </div>
          
          <div style="padding: 35px; background: #f8fafc;">
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              
              <p style="color: #475569; margin: 0 0 15px 0;">Halo <strong>${userName || 'Mahasiswa'}</strong>,</p>
              
              <p style="color: #475569; line-height: 1.6;">
                Terima kasih telah bergabung dengan Kamus Mahasiswa. Untuk mengaktifkan fitur lengkap dan menghilangkan tanda peringatan di profil Anda, silakan verifikasi alamat email Anda.
              </p>

              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e293b; font-weight: bold;">Masa Berlaku:</p>
                <p style="margin: 5px 0 0 0; color: #475569; font-style: italic;">
                  Link verifikasi ini akan kedaluwarsa dalam <strong>24 jam</strong>.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  ✅ Verifikasi Email Saya
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                Jika tombol di atas tidak berfungsi, salin dan tempel link berikut di browser Anda:<br>
                <span style="color: #3b82f6;">${verificationUrl}</span>
              </p>

            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    
    return { success: true };

  } catch (error) {
    console.error('Verification email failed:', error);
    throw new Error('Gagal mengirim email verifikasi');
  }
};

const sendArticleStatusNotification = async (authorEmail, authorName, articleTitle, status, articleId, feedback = '', senderData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email not configured. Status notification for:', authorEmail);
      return { success: true, messageId: 'dev-mode' };
    }

    const transporter = createTransporter();
    const senderCard = senderData ? senderCardHtml(senderData.name, senderData.email, senderData.avatar, 'Dikirim Oleh Penulis') : '';
    
    // Tentukan konten berdasarkan status
    let subject, title, message, buttonText, buttonLink, colorTheme;

    if (status === 'published') {
      subject = `🚀 Hore! Artikel Terbit: "${articleTitle}"`;
      title = 'Artikel Anda Telah Terbit!';
      message = `Selamat <strong>${authorName}</strong>! Artikel Anda telah disetujui oleh editor dan sekarang sudah tayang di Kamus Mahasiswa.`;
      buttonText = '🌍 Lihat Artikel';
      buttonLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/article/${articleId}`;
      colorTheme = '#10b981'; // Green
    } else {
      // Asumsi status 'rejected' atau 'revisi'
      subject = `📝 Perlu Revisi: "${articleTitle}"`;
      title = 'Artikel Memerlukan Revisi';
      message = `Editor telah meninjau artikel Anda dan memberikan beberapa catatan perbaikan sebelum dapat dipublikasikan.`;
      buttonText = '✍️ Edit Artikel';
      buttonLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/writer/edit/${articleId}`; // Link ke halaman edit penulis
      colorTheme = '#f59e0b'; // Amber/Orange
    }

    const mailOptions = {
      from: `"Kamus Mahasiswa Editor" <${process.env.EMAIL_USER}>`,
      to: authorEmail,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, ${colorTheme} 0%, #3b82f6 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
          </div>
          
          ${senderCard}
          <div style="padding: 35px; background: #f8fafc;">
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <p style="color: #475569; margin: 0 0 15px 0;">Halo <strong>${authorName}</strong>,</p>
              
              <p style="color: #475569; line-height: 1.6;">
                ${message}
              </p>

              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${colorTheme};">
                <p style="margin: 0; color: #1e293b; font-weight: bold;">Judul Artikel:</p>
                <p style="margin: 5px 0 0 0; color: #475569; font-style: italic;">"${articleTitle}"</p>
                
                ${feedback ? `
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                <p style="margin: 0; color: #1e293b; font-weight: bold;">Catatan Editor:</p>
                <p style="margin: 5px 0 0 0; color: #ef4444; font-style: italic;">"${feedback}"</p>
                ` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${buttonLink}" 
                   style="background: ${colorTheme}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  ${buttonText}
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                Semangat berkarya! 🚀
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Status email sent to ${authorName} (${status})`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Notification failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendDraftReviewNotification,
  sendVerificationEmail,
  sendArticleStatusNotification
};

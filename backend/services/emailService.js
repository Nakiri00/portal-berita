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

// Send reset password email
const sendResetPasswordEmail = async (email, resetLink, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Portal Berita Mahasiswa" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: email,
      subject: 'Reset Password - Portal Berita Mahasiswa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Portal Berita Mahasiswa</h1>
            <p style="color: white; margin: 5px 0 0 0;">Reset Password</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Halo ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Kami menerima permintaan untuk mereset password akun Anda di Portal Berita Mahasiswa.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Klik tombol di bawah ini untuk mereset password Anda:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              Atau copy dan paste link berikut di browser Anda:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Penting:</strong> Link ini akan berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              Jika tombol tidak berfungsi, copy dan paste link di atas ke browser Anda.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2025 Portal Berita Mahasiswa. Semua hak dilindungi.</p>
            <p style="margin: 5px 0 0 0;">Email ini dikirim secara otomatis, mohon tidak membalas.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Portal Berita Mahasiswa" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: email,
      subject: 'Selamat Datang di Portal Berita Mahasiswa!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Portal Berita Mahasiswa</h1>
            <p style="color: white; margin: 5px 0 0 0;">Selamat Datang!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Halo ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Selamat! Akun Anda telah berhasil dibuat di Portal Berita Mahasiswa.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Sekarang Anda dapat:
            </p>
            
            <ul style="color: #666; line-height: 1.8;">
              <li>Membaca berita terkini dari kampus</li>
              <li>Menyimpan artikel favorit</li>
              <li>Mengikuti penulis favorit</li>
              <li>Berpartisipasi dalam diskusi</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Mulai Jelajahi
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2025 Portal Berita Mahasiswa. Semua hak dilindungi.</p>
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

module.exports = {
  sendResetPasswordEmail,
  sendWelcomeEmail
};

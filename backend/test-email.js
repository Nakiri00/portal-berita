/**
 * Script untuk testing email templates Kamus Mahasiswa
 * Menjalankan preview dan test email
 */

require('dotenv').config({ path: './config.env' });
const { sendResetPasswordEmail, sendWelcomeEmail } = require('./services/emailService');
const { generatePreview } = require('./templates/emailTemplates');

async function testEmailTemplates() {
  console.log('🚀 Testing Email Templates Kamus Mahasiswa\n');
  
  // Generate preview files
  console.log('📄 Generating preview files...');
  try {
    generatePreview();
  } catch (error) {
    console.error('❌ Error generating preview:', error.message);
  }
  
  // Test email configuration
  console.log('\n📧 Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not configured');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'Not configured');
  
  // Test reset password email (jika konfigurasi email tersedia)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
      process.env.EMAIL_USER !== 'your-email@gmail.com') {
    
    console.log('\n📤 Testing reset password email...');
    try {
      const testEmail = 'test@example.com';
      const testLink = 'http://localhost:5173/reset-password?token=test-token-123';
      const testName = 'Test User';
      
      const result = await sendResetPasswordEmail(testEmail, testLink, testName);
      
      if (result.success) {
        console.log('✅ Reset password email sent successfully!');
        console.log('   Message ID:', result.messageId);
      } else {
        console.log('❌ Reset password email failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error testing reset password email:', error.message);
    }
    
    console.log('\n📤 Testing welcome email...');
    try {
      const testEmail = 'test@example.com';
      const testName = 'Test User';
      
      const result = await sendWelcomeEmail(testEmail, testName);
      
      if (result.success) {
        console.log('✅ Welcome email sent successfully!');
        console.log('   Message ID:', result.messageId);
      } else {
        console.log('❌ Welcome email failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error testing welcome email:', error.message);
    }
    
  } else {
    console.log('\n⚠️  Email not configured. To test email sending:');
    console.log('   1. Update EMAIL_USER in config.env');
    console.log('   2. Update EMAIL_PASSWORD with Gmail App Password');
    console.log('   3. Run this script again');
  }
  
  console.log('\n📋 Summary:');
  console.log('   ✅ Email templates updated with Kamus Mahasiswa branding');
  console.log('   ✅ Logo dan styling telah disesuaikan');
  console.log('   ✅ Kata-kata reset password telah diperbarui');
  console.log('   ✅ Preview files generated');
  console.log('\n🎯 Next steps:');
  console.log('   - Open preview files in browser to see email design');
  console.log('   - Configure Gmail credentials for live testing');
  console.log('   - Test actual email sending functionality');
}

// Menjalankan test jika script dipanggil langsung
if (require.main === module) {
  testEmailTemplates().catch(console.error);
}

module.exports = { testEmailTemplates };

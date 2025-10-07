const { Resend } = require('resend');

// Script para probar la funcionalidad de Resend
async function testResend() {
  console.log('🧪 Probando Resend...');
  
  const resend = new Resend('re_Vo8z4maQ_8ruYVtSYkU5Ye1ue2CPDPbcT');

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['admin@aiquaa.com'],
      subject: 'Prueba de Resend - AIQUAA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Prueba de Resend</p>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1F2937; margin-top: 0;">¡Hola!</h2>
            <p>Este es un email de prueba para verificar que Resend está funcionando correctamente con AIQUAA.</p>
            <p>Si recibes este email, significa que la configuración de Resend está funcionando perfectamente.</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px; color: #4F46E5;"><strong>✅ Resend configurado correctamente</strong></p>
            </div>
            <p>Características implementadas:</p>
            <ul>
              <li>✅ Envío de emails de verificación</li>
              <li>✅ Envío de emails de reset de contraseña</li>
              <li>✅ Envío de emails de bienvenida</li>
              <li>✅ Envío de códigos 2FA por email</li>
              <li>✅ Envío de alertas de seguridad</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px;">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 ID del email:', data?.id);
    console.log('📧 Destinatario: admin@aiquaa.com');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la prueba
testResend();


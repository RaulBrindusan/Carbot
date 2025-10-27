import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

interface Car {
  carId: string;
  makeModel: string;
  fullTitle: string;
  year: string;
  profit: number;
  profitPercentage: number;
  totalCost: number;
  endAuctionPrice: number;
  auto1Link?: string;
}

// GET endpoint for cron jobs (Vercel Cron uses GET by default)
export async function GET(request: Request) {
  try {
    // Verify the request is from a cron job (optional security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cron request');
      // In production, you might want to return 401
      // For now, we'll allow it to work without auth during testing
    }

    // Fetch top 10 most profitable cars from Firebase
    const carsQuery = query(
      collection(db, 'cars'),
      orderBy('profit', 'desc'),
      limit(10)
    );

    const carsSnapshot = await getDocs(carsQuery);
    const topCars: Car[] = carsSnapshot.docs.map((doc) => ({
      carId: doc.id,
      ...doc.data(),
    })) as Car[];

    console.log(`Fetched ${topCars.length} cars for daily report`);

    // Get the email password from environment variable
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailPassword) {
      console.error('Missing email password in environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error - email service not properly configured'
        },
        { status: 500 }
      );
    }

    // Create transporter with Brevo SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: '8942bd001@smtp-brevo.com',
        pass: emailPassword
      }
    });

    // Format currency helper
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);
    };

    // Calculate total profit
    const totalProfit = topCars.reduce((sum, car) => sum + car.profit, 0);
    const avgProfit = topCars.length > 0 ? totalProfit / topCars.length : 0;

    // Generate plain text version
    const textContent = `
Raport Zilnic: Top 10 Cele Mai Profitabile Mașini

Profit Mediu: ${formatCurrency(avgProfit)}
Total Mașini: ${topCars.length}

${topCars.map((car, index) => `${index + 1}. ${car.makeModel} (${car.year})
   Profit: ${formatCurrency(car.profit)} (${car.profitPercentage?.toFixed(1)}%)
   Cost: ${formatCurrency(car.totalCost)} | Licitație: ${formatCurrency(car.endAuctionPrice)}
   ${car.auto1Link ? `Link: ${car.auto1Link}` : ''}`).join('\n\n')}

${topCars.length === 0 ? 'Nu s-au găsit mașini profitabile în acest moment.' : ''}

Vizitează Auto1 pentru oferte grozave: https://www.auto1.com

Raport generat la: ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}
    `;

    // Generate HTML table rows for cars
    const carsHtmlRows = topCars.map((car, index) => `
      <tr>
        <td style="padding: 0; background-color: #f8f9fa; border-left: 4px solid #667eea;">
          ${car.auto1Link ? `<a href="${car.auto1Link}" style="display: block; padding: 15px; text-decoration: none; color: inherit; cursor: pointer;">` : `<div style="padding: 15px;">`}
            <strong style="color: #667eea; font-size: 18px;">
              ${index + 1}. ${car.makeModel} (${car.year})
            </strong>
            <p style="margin: 5px 0 0 0; color: #666;">${car.fullTitle || ''}</p>
            <div style="margin-top: 10px;">
              <span style="color: #28a745; font-weight: bold; margin-right: 15px;">💰 Profit: ${formatCurrency(car.profit)}</span>
              <span style="color: #666; margin-right: 15px;">📊 Marjă: ${car.profitPercentage?.toFixed(1)}%</span>
            </div>
            <div style="margin-top: 5px;">
              <span style="color: #666; margin-right: 15px;">💵 Cost: ${formatCurrency(car.totalCost)}</span>
              <span style="color: #666;">🔨 Licitație: ${formatCurrency(car.endAuctionPrice)}</span>
            </div>
            ${car.auto1Link ? `
            <div style="margin-top: 10px;">
              <span style="display: inline-block; padding: 8px 16px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">Vezi pe Auto1 →</span>
            </div>` : ''}
          ${car.auto1Link ? `</a>` : `</div>`}
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
    `).join('');

    // Set up email data
    const mailOptions = {
      from: 'contact@az-translations.ro',
      to: 'brindusanraull@gmail.com',
      subject: `Raport Zilnic: Top 10 Cele Mai Profitabile Mașini - ${new Date().toLocaleDateString('ro-RO')}`,
      text: textContent,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📊 Raport Zilnic de Profit</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Top 10 Cele Mai Profitabile Mașini</p>
              <p style="color: #f0f0f0; margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </td>
          </tr>

          <!-- Summary Stats -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Profit Mediu</p>
                    <p style="margin: 5px 0 0 0; color: #667eea; font-size: 24px; font-weight: bold;">${formatCurrency(avgProfit)}</p>
                  </td>
                  <td style="padding: 10px; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Total Mașini</p>
                    <p style="margin: 5px 0 0 0; color: #764ba2; font-size: 24px; font-weight: bold;">${topCars.length}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Iată cele mai profitabile 10 mașini de astăzi bazate pe analiza curentă a pieței:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                ${topCars.length > 0 ? carsHtmlRows : `
                <tr>
                  <td style="padding: 30px; text-align: center; color: #666;">
                    Nu s-au găsit mașini profitabile în acest moment.
                  </td>
                </tr>
                `}
              </table>

              <p style="color: #666; font-size: 14px; margin-bottom: 0; margin-top: 30px;">
                Raport generat la: ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                CarBot - Informații despre Piața Auto
              </p>
              <p style="color: #999; font-size: 11px; margin: 5px 0 0 0;">
                Raport automat zilnic trimis la 22:20 ora României
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Daily report email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Daily report sent successfully',
      messageId: info.messageId,
      carsCount: topCars.length,
      totalProfit: totalProfit
    });

  } catch (error: any) {
    console.error('Error sending daily report:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send daily report',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

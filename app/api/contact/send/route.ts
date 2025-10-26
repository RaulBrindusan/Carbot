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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestBody = await request.json();

    // Validate required fields
    const { name, email, phone, message } = requestBody;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields: [
            !name ? 'name' : null,
            !email ? 'email' : null,
            !phone ? 'phone' : null,
            !message ? 'message' : null
          ].filter(Boolean)
        },
        { status: 400 }
      );
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

    // Get the email password from environment variable
    const emailPassword = process.env.EMAIL_PASSWORD;

    console.log('Email configuration check:', {
      smtpConfigured: !!emailPassword,
      nodeEnv: process.env.NODE_ENV
    });

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
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    // Generate plain text version
    const textContent = `
Top 10 Most Profitable Cars

${topCars.map((car, index) => `${index + 1}. ${car.makeModel} (${car.year})
   Profit: ${formatCurrency(car.profit)} (${car.profitPercentage?.toFixed(1)}%)
   Cost: ${formatCurrency(car.totalCost)} | Auction: ${formatCurrency(car.endAuctionPrice)}
   ${car.auto1Link ? `Link: ${car.auto1Link}` : ''}`).join('\n\n')}

${topCars.length === 0 ? 'No profitable cars found at this time.' : ''}

Visit Auto1 to find great deals: https://www.auto1.com

Sent at: ${new Date().toLocaleString()}
    `;

    // Generate HTML table rows for cars
    const carsHtmlRows = topCars.map((car, index) => `
      <tr>
        <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea;">
          <strong style="color: #667eea; font-size: 18px;">${index + 1}. ${car.makeModel} (${car.year})</strong>
          <p style="margin: 5px 0 0 0; color: #666;">${car.fullTitle || ''}</p>
          <div style="margin-top: 10px; display: flex; gap: 15px; flex-wrap: wrap;">
            <span style="color: #28a745; font-weight: bold;">Profit: ${formatCurrency(car.profit)}</span>
            <span style="color: #666;">Margin: ${car.profitPercentage?.toFixed(1)}%</span>
            <span style="color: #666;">Cost: ${formatCurrency(car.totalCost)}</span>
            <span style="color: #666;">Auction: ${formatCurrency(car.endAuctionPrice)}</span>
          </div>
          ${car.auto1Link ? `
          <div style="margin-top: 10px;">
            <a href="${car.auto1Link}" style="display: inline-block; padding: 8px 16px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">View on Auto1</a>
          </div>` : ''}
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
    `).join('');

    // Set up email data - sending to brindusanraull@gmail.com
    const mailOptions = {
      from: 'contact@az-translations.ro',
      to: 'brindusanraull@gmail.com',
      replyTo: email,
      subject: `Top 10 Most Profitable Cars - CarBot Report`,
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Top 10 Most Profitable Cars</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">CarBot Market Analysis</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Here are the top 10 most profitable cars based on current market analysis:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                ${topCars.length > 0 ? carsHtmlRows : `
                <tr>
                  <td style="padding: 30px; text-align: center; color: #666;">
                    No profitable cars found at this time.
                  </td>
                </tr>
                `}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.auto1.com" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Browse Cars on Auto1
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                Sent at: ${new Date().toLocaleString()}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                CarBot - Your Automotive Market Intelligence
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

    try {
      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId
      });
    } catch (emailError: any) {
      console.error('SMTP Error:', emailError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email. Please try again later.',
          // Don't expose full error details in production
          ...(process.env.NODE_ENV === 'development' && { details: emailError.message })
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your request. Please try again later.'
      },
      { status: 500 }
    );
  }
}

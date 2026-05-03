import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="page" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ maxWidth: 800, padding: '60px 20px' }}>
        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ color: 'var(--gray)', fontSize: 14 }}>← Back to Home</Link>
          <h1 style={{ marginTop: 16, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--gray)' }}>Last updated: May 2026</p>
        </div>

        <p style={{ color: 'var(--gray)', lineHeight: 1.8, marginBottom: 32 }}>
          At SkillBazaar, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>

        {[
          {
            title: '1. Information We Collect',
            items: [
              'Account information: name, email address, username, date of birth',
              'Profile information: bio, country, avatar, preferred language',
              'Transaction data: orders placed, gigs created, wallet activity',
              'Communication data: messages sent and received on the platform',
              'Usage data: pages visited, searches performed, features used',
              'Device information: IP address, browser type, and operating system'
            ]
          },
          {
            title: '2. How We Use Your Information',
            items: [
              'To provide, operate, and improve our marketplace services',
              'To process transactions and send related notifications',
              'To personalize your experience with relevant gig recommendations',
              'To communicate with you about orders, updates, and promotions',
              'To detect and prevent fraudulent or unauthorized activity',
              'To comply with legal obligations and enforce our Terms of Service'
            ]
          },
          {
            title: '3. Information Sharing',
            items: [
              'We do not sell your personal information to third parties',
              'Seller profiles (username, bio) are visible to all users',
              'Order details are shared between the relevant buyer and seller only',
              'We may share data with service providers who help us operate the platform',
              'We may disclose data if required by law or to protect our legal rights'
            ]
          },
          {
            title: '4. Data Security',
            items: [
              'Passwords are hashed using industry-standard bcrypt encryption',
              'All data is transmitted over secure HTTPS connections',
              'We regularly review our security practices and infrastructure',
              'We limit access to personal data to authorized personnel only'
            ]
          },
          {
            title: '5. Your Rights & Controls',
            items: [
              'Access: You can view all your personal data in your Profile and Settings',
              'Update: You can edit your profile information at any time',
              'Delete: You can permanently delete your account from the Settings page',
              'Portability: You can request an export of your data by contacting us',
              'Opt-out: You can unsubscribe from marketing emails at any time'
            ]
          },
          {
            title: '6. Cookies & Local Storage',
            items: [
              'We use local storage to save your theme preference (light/dark mode)',
              'Recent searches are stored locally in your browser only, not on our servers',
              'Authentication tokens are stored locally and expire after 7 days',
              'We do not use third-party advertising or tracking cookies'
            ]
          },
          {
            title: '7. Data Retention',
            items: [
              'Account data is retained as long as your account is active',
              'Transaction records are kept for 7 years for legal and accounting purposes',
              'Messages are retained for 2 years, then automatically purged',
              'Upon account deletion, personal data is permanently removed within 30 days'
            ]
          }
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h3 style={{ color: 'var(--dark)', marginBottom: 12 }}>{section.title}</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--gray)', lineHeight: 2 }}>
              {section.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 24, background: 'var(--light)', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ color: 'var(--gray)', fontSize: 14 }}>
            Questions about your privacy? Contact our Data Protection team at{' '}
            <a href="mailto:privacy@skillbazaar.com" style={{ color: 'var(--primary)' }}>privacy@skillbazaar.com</a>
          </p>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--gray)' }}>
            Also see our <Link to="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

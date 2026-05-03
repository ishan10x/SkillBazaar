import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="page" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ maxWidth: 800, padding: '60px 20px' }}>
        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ color: 'var(--gray)', fontSize: 14 }}>← Back to Home</Link>
          <h1 style={{ marginTop: 16, marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ color: 'var(--gray)' }}>Last updated: May 2026</p>
        </div>

        {[
          {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using SkillBazaar, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.'
          },
          {
            title: '2. Use of the Platform',
            content: 'SkillBazaar provides an online marketplace for freelance services. You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others. Any abuse, fraudulent activity, or misrepresentation will result in immediate account suspension.'
          },
          {
            title: '3. Seller Obligations',
            content: 'Sellers agree to deliver services as described in their gig listings. Sellers must respond to buyer messages within a reasonable time, deliver orders by the agreed deadline, and maintain accurate and honest service descriptions.'
          },
          {
            title: '4. Buyer Obligations',
            content: 'Buyers agree to provide accurate project requirements and make timely payments. Buyers may not request services that violate laws or SkillBazaar policies. Chargebacks and payment disputes must be raised through the platform.'
          },
          {
            title: '5. Fees & Payments',
            content: 'SkillBazaar charges a 10% service fee on all completed transactions. Payments are held securely until an order is marked as completed. Funds are released to sellers after the order completion period.'
          },
          {
            title: '6. Cancellations & Refunds',
            content: 'Orders may be cancelled by mutual agreement before the work is delivered. Refunds are issued to the buyer\'s SkillBazaar wallet. SkillBazaar reserves the right to mediate disputes and issue refunds at its discretion.'
          },
          {
            title: '7. Intellectual Property',
            content: 'Upon full payment, all work delivered by the seller transfers ownership to the buyer, unless a different arrangement is explicitly stated in the gig description. Sellers retain the right to showcase work in their portfolio unless the buyer requests otherwise.'
          },
          {
            title: '8. Prohibited Content',
            content: 'Users may not offer or request services that are illegal, fraudulent, harmful, or violate third-party rights. This includes but is not limited to: fake reviews, plagiarism, spam, malware, or any content that promotes violence or discrimination.'
          },
          {
            title: '9. Limitation of Liability',
            content: 'SkillBazaar is a marketplace platform and is not responsible for the quality of services provided by sellers. We do not guarantee continuous, uninterrupted access to our services. Our total liability to you shall not exceed the amount paid for the service in dispute.'
          },
          {
            title: '10. Changes to Terms',
            content: 'SkillBazaar reserves the right to modify these Terms at any time. We will notify users of significant changes via email or platform announcement. Your continued use of the platform after changes constitutes acceptance of the new terms.'
          }
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h3 style={{ color: 'var(--dark)', marginBottom: 10 }}>{section.title}</h3>
            <p style={{ color: 'var(--gray)', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 24, background: 'var(--light)', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ color: 'var(--gray)', fontSize: 14 }}>
            Questions about our Terms? Contact us at{' '}
            <a href="mailto:legal@skillbazaar.com" style={{ color: 'var(--primary)' }}>legal@skillbazaar.com</a>
          </p>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--gray)' }}>
            Also see our <Link to="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

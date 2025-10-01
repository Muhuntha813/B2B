const Terms = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `[TBD - Legal acceptance clause] By accessing and using the B2B Plastics platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: "2. Platform Description",
      content: `[TBD - Platform description] B2B Plastics is a business-to-business marketplace that connects buyers and sellers in the plastics industry, including machinery, materials, manpower, and mould design services. The platform facilitates transactions but does not directly participate in the sale of goods or services.`
    },
    {
      title: "3. User Accounts and Registration",
      content: `[TBD - Account terms] Users must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.`
    },
    {
      title: "4. Acceptable Use Policy",
      content: `[TBD - Usage guidelines] Users agree to use the platform only for lawful purposes and in accordance with these Terms. Prohibited activities include but are not limited to: posting false or misleading information, engaging in fraudulent activities, violating intellectual property rights, or attempting to disrupt the platform's functionality.`
    },
    {
      title: "5. Listing and Transaction Terms",
      content: `[TBD - Transaction terms] Sellers are responsible for the accuracy of their listings and the quality of their products or services. Buyers are responsible for conducting due diligence before making purchases. B2B Plastics acts as a facilitator and is not responsible for the completion or quality of transactions between users.`
    },
    {
      title: "6. Payment and Fees",
      content: `[TBD - Payment terms] Payment terms are agreed upon between buyers and sellers. B2B Plastics may charge platform fees for certain services, which will be clearly disclosed. All fees are non-refundable unless otherwise specified in writing.`
    },
    {
      title: "7. Intellectual Property Rights",
      content: `[TBD - IP terms] The platform and its original content, features, and functionality are owned by B2B Plastics and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Users retain ownership of content they post but grant us a license to use it on the platform.`
    },
    {
      title: "8. Privacy and Data Protection",
      content: `[TBD - Privacy terms] Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our platform. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      title: "9. Disclaimers and Limitation of Liability",
      content: `[TBD - Liability disclaimers] The platform is provided "as is" without warranties of any kind. B2B Plastics shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform. Our total liability shall not exceed the amount paid by you for platform services in the 12 months preceding the claim.`
    },
    {
      title: "10. Indemnification",
      content: `[TBD - Indemnification clause] You agree to indemnify and hold harmless B2B Plastics and its affiliates from any claims, damages, losses, or expenses arising from your use of the platform, violation of these terms, or infringement of any third-party rights.`
    },
    {
      title: "11. Termination",
      content: `[TBD - Termination terms] We may terminate or suspend your account and access to the platform immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason in our sole discretion.`
    },
    {
      title: "12. Dispute Resolution",
      content: `[TBD - Dispute resolution] Any disputes arising from these Terms or your use of the platform shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization]. The arbitration shall take place in [Jurisdiction] and be conducted in English.`
    },
    {
      title: "13. Governing Law",
      content: `[TBD - Governing law] These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions. You agree to submit to the personal jurisdiction of the courts located in [Jurisdiction].`
    },
    {
      title: "14. Changes to Terms",
      content: `[TBD - Amendment terms] We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Your continued use of the platform after such modifications constitutes acceptance of the updated Terms.`
    },
    {
      title: "15. Contact Information",
      content: `[TBD - Contact details] If you have any questions about these Terms of Service, please contact us at legal@b2bplastics.com or through our contact page. We will respond to inquiries within 5 business days.`
    }
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-primary-100 mb-4">
              Last updated: [TBD - Date]
            </p>
            <p className="text-lg text-primary-200">
              Please read these terms carefully before using our platform
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="mb-12">
              <div className="bg-background-secondary border-l-4 border-primary rounded-r-lg p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-3">
                  Important Notice
                </h2>
                <p className="text-text-secondary">
                  <strong>[TBD - Legal notice]</strong> These Terms of Service constitute a legally binding agreement between you and B2B Plastics. Please read them carefully and contact us if you have any questions before using our platform.
                </p>
              </div>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="card">
                  <h2 className="text-xl font-bold text-text-primary mb-4">
                    {section.title}
                  </h2>
                  <p className="text-text-secondary leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Notice */}
            <div className="mt-12 bg-background-secondary rounded-xl p-8 text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Questions About These Terms?
              </h3>
              <p className="text-text-secondary mb-6">
                <strong>[TBD]</strong> If you have any questions or concerns about these Terms of Service, please don't hesitate to contact our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:legal@b2bplastics.com" 
                  className="btn btn-primary"
                >
                  Contact Legal Team
                </a>
                <a 
                  href="/contact" 
                  className="btn btn-outline"
                >
                  General Contact
                </a>
              </div>
            </div>

            {/* Effective Date */}
            <div className="mt-8 text-center text-sm text-text-tertiary">
              <p>
                <strong>[TBD]</strong> These Terms of Service are effective as of [Date] and were last updated on [Date].
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Terms
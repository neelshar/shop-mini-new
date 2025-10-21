import React from 'react'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Our keyboard customization app collects the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Keyboard configurations, preferences, and customization choices you make within the app</li>
                <li><strong>Technical Data:</strong> Device information, browser type, and app performance metrics</li>
                <li><strong>Shopify Integration:</strong> Cart data and purchase information when you add products to your cart</li>
                <li><strong>Analytics:</strong> Anonymous usage statistics to improve our service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <div className="text-slate-300 space-y-4">
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our keyboard customization services</li>
                <li>Process your orders and manage your shopping cart</li>
                <li>Personalize your experience with recommended products</li>
                <li>Analyze app performance and user behavior to enhance functionality</li>
                <li>Communicate with you about your orders and app updates</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Sharing and Disclosure</h2>
            <div className="text-slate-300 space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Shopify Integration:</strong> Your cart and purchase data is shared with Shopify to process orders</li>
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our app</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <div className="text-slate-300 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Our app uses cookies and similar tracking technologies to enhance your experience, 
                remember your preferences, and analyze usage patterns. You can control cookie settings 
                through your browser preferences.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Children's Privacy</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                If you have any questions about this privacy policy or our data practices, 
                please contact us at:
              </p>
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <p><strong>Email:</strong> privacy@keyboardcustomizer.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
          >
            ← Back to App
          </button>
        </div>
      </div>
    </div>
  )
}

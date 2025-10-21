import React from 'react'

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                By accessing and using our keyboard customization app, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Our app provides keyboard customization tools that allow users to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Design and visualize custom keyboard configurations</li>
                <li>Browse and select keyboard components (keycaps, switches, cases)</li>
                <li>Preview keyboard builds with 3D visualization</li>
                <li>Add selected products to shopping cart via Shopify integration</li>
                <li>Access keyboard sound profiles and customization options</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <div className="text-slate-300 space-y-4">
              <p>As a user of our service, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the app only for lawful purposes</li>
                <li>Not attempt to reverse engineer or modify the app</li>
                <li>Not use the service to transmit harmful or malicious content</li>
                <li>Respect intellectual property rights of all parties</li>
                <li>Provide accurate information when making purchases</li>
                <li>Not create multiple accounts to circumvent restrictions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                The app and its original content, features, and functionality are owned by us and are 
                protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works of our content 
                without explicit written permission.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Our app integrates with Shopify for e-commerce functionality. When you make purchases 
                through our app, you are subject to Shopify's terms of service and privacy policy. 
                We are not responsible for third-party services or their policies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Disclaimers and Limitations</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                The service is provided "as is" without warranties of any kind. We disclaim all 
                warranties, express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties regarding the accuracy or reliability of the service</li>
                <li>Warranties that the service will be uninterrupted or error-free</li>
              </ul>
              <p>
                In no event shall we be liable for any indirect, incidental, special, consequential, 
                or punitive damages arising out of your use of the service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Payment and Refunds</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                All payments are processed through Shopify. Refund policies are governed by the 
                individual merchants and Shopify's terms. We do not process payments directly 
                and are not responsible for payment disputes or refunds.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Privacy</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of the service, to understand our practices.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                We may terminate or suspend your access to the service immediately, without prior 
                notice or liability, for any reason whatsoever, including without limitation if you 
                breach the terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                These terms shall be interpreted and governed by the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of 
                any material changes by posting the new terms on this page and updating the 
                "Last updated" date.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
            <div className="text-slate-300 space-y-4">
              <p>
                If you have any questions about these terms of service, please contact us at:
              </p>
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <p><strong>Email:</strong> legal@keyboardcustomizer.com</p>
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

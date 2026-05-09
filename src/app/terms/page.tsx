import PageLayout from "@/components/landing/PageLayout";

export default function TermsPage() {
  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray">
          <h1>Terms of Service</h1>
          <p className="text-gray-500">Last updated: May 9, 2026</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By creating an account or using Vehicle Tracker, you agree to these terms. If you do not agree,
            do not use the service.
          </p>

          <h2>Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity that occurs under your account. You must provide accurate information when registering.
          </p>

          <h2>Service Description</h2>
          <p>
            Vehicle Tracker provides vehicle history tracking, maintenance logging, reminder notifications,
            and PDF report generation. Free accounts are limited to 2 vehicles. Paid plans offer additional
            features as described on our Pricing page.
          </p>

          <h2>Subscription & Billing</h2>
          <p>
            Paid subscriptions are billed monthly or annually as selected at checkout. You can cancel at any
            time. Cancellation takes effect at the end of the current billing period. No refunds are provided
            for partial months.
          </p>

          <h2>Acceptable Use</h2>
          <p>
            You agree not to misuse the service, including but not limited to: uploading false data, attempting
            to breach security, using the service for illegal purposes, or interfering with other users&apos; access.
          </p>

          <h2>Data Ownership</h2>
          <p>
            You retain ownership of all data you enter into the service. Vehicle Tracker claims no ownership
            over your vehicle information, maintenance records, or uploaded content.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Vehicle Tracker is provided &ldquo;as is&rdquo; without warranty. We are not liable for damages arising from
            use of the service, including missed maintenance, data loss, or service interruptions.
          </p>

          <h2>Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms. You may delete
            your account at any time from your dashboard settings.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms from time to time. Continued use after changes constitutes acceptance
            of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Reach out via our Contact page or legal@vehicletracker.app.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

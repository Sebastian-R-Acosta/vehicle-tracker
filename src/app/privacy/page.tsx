import PageLayout from "@/components/landing/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray">
          <h1>Privacy Policy</h1>
          <p className="text-gray-500">Last updated: May 9, 2026</p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide when creating an account, adding vehicles, logging maintenance,
            and communicating with us. This includes your name, email address, vehicle information (make, model,
            VIN, mileage), and service records.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            Your data is used to provide and improve the Vehicle Tracker service: displaying vehicle history,
            sending maintenance reminders, generating reports, and communicating service-related notifications.
            We never sell your personal data to third parties.
          </p>

          <h2>Data Storage & Security</h2>
          <p>
            Your data is stored securely on encrypted servers. We use industry-standard security measures including
            encryption at rest and in transit. Vehicle history data is retained as long as your account is active.
          </p>

          <h2>Data Sharing</h2>
          <p>
            Vehicle history and maintenance records are only shared when you explicitly choose to transfer a vehicle
            to another owner via our transfer code system. We do not share your personal information with third
            parties except as required by law.
          </p>

          <h2>Your Rights</h2>
          <p>
            You can access, update, or delete your account and associated data at any time from your dashboard
            settings. You can export your vehicle data as PDF reports. Account deletion removes all associated
            vehicle and maintenance records.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related inquiries, contact us via our Contact page or email privacy@vehicletracker.app.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

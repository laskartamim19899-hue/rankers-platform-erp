import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-slate-950 py-20 px-6 md:px-12 text-white text-center">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Privacy Policy</h2>
        </section>

        <div className="max-w-4xl mx-auto p-6 md:p-12 py-20 md:py-32 prose prose-slate">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Introduction</h2>
          <p className="text-slate-600 mb-10 leading-relaxed text-base md:text-lg">
            At Rankers' Platform, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our website and ERP services.
          </p>

          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-amber-600 border-l-4 border-amber-500 pl-4">Data Collection</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                We collect personal data such as your name, phone number, and email address when you fill out our admission forms or contact us. We also collect academic data for registered students to track performance and attendance.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-amber-600 border-l-4 border-amber-500 pl-4">How We Use Your Data</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-4 font-medium">
                <li>To process admission inquiries and registrations.</li>
                <li>To send important academic updates and fee alerts.</li>
                <li>To manage internal student records via our ERP suite.</li>
                <li>To improve our educational services and website experience.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-amber-600 border-l-4 border-amber-500 pl-4">Security</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                We implement enterprise-grade security measures to ensure your data is protected from unauthorized access or disclosure.
              </p>
            </div>
          </div>

          <footer className="mt-20 pt-8 border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated: April 2026</p>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}

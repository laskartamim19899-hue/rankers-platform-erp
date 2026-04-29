import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="bg-white min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-primary py-20 px-6 md:px-12 text-white text-center">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">Terms of Service</h2>
        </section>

        <div className="max-w-4xl mx-auto p-6 md:p-12 py-20 md:py-32 prose prose-slate">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Agreement to Terms</h2>
          <p className="text-slate-600 mb-10 leading-relaxed text-base md:text-lg">
            By accessing or using the Rankers' Platform ERP Suite, you agree to be bound by these Terms of Service. If you do not agree, you may not access our services.
          </p>

          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-primary border-l-4 border-primary pl-4">Usage License</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Permission is granted to institutional staff and students to use the platform for academic and administrative purposes only. Unauthorized data extraction or reverse engineering is strictly prohibited.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-primary border-l-4 border-primary pl-4">User Accounts</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Users are responsible for maintaining the confidentiality of their login credentials. Any activity under your account is your responsibility.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-primary border-l-4 border-primary pl-4">Service Availability</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                While we strive for 99.9% uptime, Rankers' Platform is not liable for any temporary service interruptions due to maintenance or technical failures.
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

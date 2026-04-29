import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SupportPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-inter">
      <Header />

      <main className="pt-20">
        <section className="bg-slate-900 py-24 px-6 md:px-12 text-white text-center">
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4 tracking-tighter">Support Center</h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                Need help with the ERP Suite or have an academic inquiry? Our technical team is here to assist you.
            </p>
        </section>

        <div className="max-w-6xl mx-auto p-6 md:p-12 -mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl">call</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Institutional Hotline</h3>
                    <p className="text-slate-500 text-sm mb-6">Available Mon-Sat, 9AM - 6PM for urgent staff support.</p>
                    <a href="tel:+918436571588" className="text-primary font-bold text-lg">+91 84365 71588</a>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl">chat</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">WhatsApp Support</h3>
                    <p className="text-slate-500 text-sm mb-6">Quick resolutions for students regarding fees and results.</p>
                    <a href="https://wa.me/918388022153" className="text-emerald-600 font-bold text-lg">83880 22153</a>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl">mail</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Email Desk</h3>
                    <p className="text-slate-500 text-sm mb-6">Official correspondence and technical bug reporting.</p>
                    <a href="mailto:support@rankersplatform.com" className="text-purple-600 font-bold">support@rankersplatform.com</a>
                </div>
            </div>

            <div className="mt-20 bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="font-black text-primary uppercase tracking-widest text-xs">Login Issues</h4>
                        <p className="font-bold text-slate-900 text-lg">I forgot my password, how do I recover it?</p>
                        <p className="text-slate-600 leading-relaxed">Use the "Forgot Password" link on the login screen. A token will be sent to your registered email to set a new password.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-black text-primary uppercase tracking-widest text-xs">Finance</h4>
                        <p className="font-bold text-slate-900 text-lg">My payment is not reflecting in the portal.</p>
                        <p className="text-slate-600 leading-relaxed">Payments via the portal reflect instantly. For offline/bank transfers, please share the receipt with the Accountant via WhatsApp.</p>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

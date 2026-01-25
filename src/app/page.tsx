import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-primary-600 mb-4">
              e-edu
            </h1>
            <p className="text-xl text-gray-700">
              O&apos;quv markazlari uchun professional CRM tizimi
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-medium">
              <div className="text-4xl mb-4">👨‍🎓</div>
              <h3 className="font-semibold text-lg mb-2">Talabalar</h3>
              <p className="text-gray-600">
                To&apos;liq talabalar bazasi va boshqaruv tizimi
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-medium">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold text-lg mb-2">To&apos;lovlar</h3>
              <p className="text-gray-600">
                Avtomatik qarz hisoblash va to&apos;lovlarni kuzatish
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-medium">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-lg mb-2">Hisobotlar</h3>
              <p className="text-gray-600">
                Real-time statistika va tahlillar
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-medium"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-medium border-2 border-primary-600"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </div>

          {/* Info */}
          <div className="mt-16 bg-white p-8 rounded-lg shadow-medium">
            <h2 className="text-2xl font-bold mb-4">Loyiha haqida</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">🎯 Asosiy funksiyalar:</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>✅ Talabalarni boshqarish</li>
                  <li>✅ Guruhlar va kurslar</li>
                  <li>✅ Davomat tizimi</li>
                  <li>✅ To&apos;lovlar va qarzlar</li>
                  <li>✅ O&apos;qituvchilar paneli</li>
                  <li>✅ Ota-onalar uchun kirish</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔧 Texnologiyalar:</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>⚡ Next.js 15 + React 19</li>
                  <li>🎨 Tailwind CSS 3.4</li>
                  <li>🔥 Firebase (Auth + Firestore)</li>
                  <li>📘 TypeScript 5.7</li>
                  <li>🔒 Multi-tenant Architecture</li>
                  <li>🛡️ Role-based Access Control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

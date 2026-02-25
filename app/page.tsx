import Link from "next/link";
import Image from "next/image";
import Header from "./(public)/_components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent">
      <Header />

      <section className="relative flex items-center px-6 md:px-16 min-h-[calc(100vh-4rem)]">
        
        <Image
          src="/images/imageOne.jpg"
          alt="Room Rental Illustration"
          fill
          priority
          className="object-cover"/>

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Room with RentEasy
          </h1>

          <p className="text-white/90 mb-6">
            RentEasy is a simple and reliable room rental platform that helps
            renters find rooms and house owners list properties with ease.
          </p>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Login
            </Link>

            <Link
              href="/register"
              className="px-6 py-3 rounded-md border border-white text-white font-medium hover:bg-white hover:text-black transition">
              Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

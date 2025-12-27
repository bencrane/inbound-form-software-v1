import ProgressiveForm from "@/components/ProgressiveForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="z-10 w-full max-w-md">
        <div className="mb-8 text-center space-y-2">
          {/* Logo placeholder */}
          <div className="mx-auto h-12 w-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-6">
            IB
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Contact Sales
          </h1>
          <p className="text-gray-600">
            Talk to our team about your enterprise needs.
          </p>
        </div>

        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-1">
          <ProgressiveForm />
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Trusted by leading companies worldwide.
        </p>
      </div>
    </main>
  );
}

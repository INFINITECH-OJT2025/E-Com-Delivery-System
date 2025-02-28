export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold text-primary">Welcome to E-Com Delivery</h1>
          <p className="text-lg text-text mt-2">Order food from your favorite restaurants.</p>
          <a href="/login" className="mt-4 px-6 py-2 bg-secondary text-text rounded">
              Get Started
          </a>
      </div>
  );
}

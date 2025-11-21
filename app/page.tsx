'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-purple-900 to-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-purple-900 to-base-100 flex flex-col">
      {/* Navigation */}
      <nav className="navbar bg-base-200/50 backdrop-blur border-b border-purple-500/20">
        <div className="navbar-start">
          <a className="btn btn-ghost text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CloudNerves
          </a>
        </div>
        <div className="navbar-end gap-3">
          <Link href="/login" className="btn btn-ghost">
            Login
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Tokenless Dining
            </span>
            <br />
            <span className="text-base-content">Revolution</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-base-content/70 mb-8 max-w-2xl mx-auto">
            Experience seamless, secure campus dining without tokens. Powered by facial recognition and intelligent identity verification.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login" className="btn btn-primary btn-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m14-4V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2z"
                />
              </svg>
              Get Started
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              Learn More
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>

          {/* Decorative Element */}
          <div className="inline-block px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-full mb-12">
            <span className="text-primary font-semibold">🔐 Secure • Fast • Intuitive</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
              Why Choose CloudNerves?
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              A secure, convenient, and innovative solution for campus dining management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/50">
              <div className="card-body">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="card-title text-primary mb-3">Enhanced Security</h3>
                <p className="text-base-content/70">
                  Multi-layer verification including facial recognition, ID card scanning, and PIN authentication ensure foolproof identity confirmation.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/50">
              <div className="card-body">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="card-title text-accent mb-3">Lightning Fast</h3>
                <p className="text-base-content/70">
                  Process students through the dining hall in seconds with our optimized entry system. No more waiting in long token lines.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/50">
              <div className="card-body">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="card-title text-info mb-3">Anti-Fraud</h3>
                <p className="text-base-content/70">
                  Real-time double-serving prevention and fraudulent transaction detection keeps your campus dining system completely secure.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/50">
              <div className="card-body">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="card-title text-success mb-3">Easy Integration</h3>
                <p className="text-base-content/70">
                  Seamlessly integrates with existing campus management systems. New managers are up and running in minutes.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/50">
              <div className="card-body">
                <div className="text-5xl mb-4">🌙</div>
                <h3 className="card-title text-warning mb-3">Smart Power Management</h3>
                <p className="text-base-content/70">
                  Auto-sleep mode conserves energy when no one is present. Environmental conscious IoT technology.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/50">
              <div className="card-body">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="card-title text-error mb-3">Real-Time Analytics</h3>
                <p className="text-base-content/70">
                  Track dining patterns, identify peak hours, and optimize operations with comprehensive analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-4 bg-base-200/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
              How It Works
            </h2>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="badge badge-lg badge-primary font-bold text-lg">1</div>
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Present Identity</h3>
                <p className="text-base-content/70">
                  Stand at the entrance sensor point. Your face is captured or present your ID card for scanning.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="badge badge-lg badge-accent font-bold text-lg">2</div>
              <div>
                <h3 className="text-xl font-bold text-accent mb-2">Verification</h3>
                <p className="text-base-content/70">
                  Our system instantly verifies your identity, eligibility, and checks for previous meals today.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="badge badge-lg badge-info font-bold text-lg">3</div>
              <div>
                <h3 className="text-xl font-bold text-info mb-2">Manager Approval</h3>
                <p className="text-base-content/70">
                  The manager sees a clear APPROVED/DENIED indicator on their dashboard with your details and verification status.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div className="badge badge-lg badge-success font-bold text-lg">4</div>
              <div>
                <h3 className="text-xl font-bold text-success mb-2">Enjoy Your Meal</h3>
                <p className="text-base-content/70">
                  Once approved, enter the dining hall and enjoy your meal without tokens, worry, or hassle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="card bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 shadow-2xl">
            <div className="card-body text-center">
              <h2 className="card-title text-3xl font-bold text-base-content mb-4 justify-center">
                Ready to Experience the Future?
              </h2>
              <p className="text-base-content/70 mb-6">
                Join CloudNerves and say goodbye to tokens forever. Sign up in seconds and start using our system today.
              </p>
              <div className="card-actions justify-center gap-4">
                <Link href="/signup" className="btn btn-primary">
                  Create Account
                </Link>
                <Link href="/login" className="btn btn-outline btn-primary">
                  Already a Member?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-base-200 border-t border-purple-500/20 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg text-primary mb-4">CloudNerves</h3>
              <p className="text-base-content/70 text-sm">
                Revolutionizing campus dining with tokenless technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-base-content mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-base-content/70">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base-content mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-base-content/70">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base-content mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-base-content/70">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-base-content/50 text-sm">
                © 2025 CloudNerves. All rights reserved.
              </p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="text-base-content/50 hover:text-primary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-base-content/50 hover:text-primary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 002.856-9.4a11.02 11.02 0 0-3.13.95a4.93 4.93 0 0 0-7.86 4.5c-4.09.425-7.79-2.087-10.23-5.964a4.92 4.92 0 0 0 1.523 6.574a4.902 4.902 0 0 1-2.228-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084a4.928 4.928 0 0 0 4.6 3.417A9.867 9.867 0 0 1 0 19.54a13.998 13.998 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985c0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

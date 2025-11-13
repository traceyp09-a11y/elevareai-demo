import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  Lock,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';
import ElevareLogo from '../components/ElevareLogo';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms analyze your data in real-time, delivering actionable intelligence.',
      color: 'from-purple-500 to-pink-500',
      delay: '0ms'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Stay ahead with predictive models that forecast trends and identify opportunities before they happen.',
      color: 'from-cyan-500 to-blue-500',
      delay: '100ms'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with SOC2, GDPR, and HIPAA standards protect your data.',
      color: 'from-green-500 to-emerald-500',
      delay: '200ms'
    },
    {
      icon: Users,
      title: 'Unified Workforce View',
      description: 'Centralize HR, HSE, Operations, and more into one seamless, intuitive platform.',
      color: 'from-orange-500 to-red-500',
      delay: '300ms'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-second response times with edge computing and intelligent caching for instant insights.',
      color: 'from-yellow-500 to-orange-500',
      delay: '400ms'
    },
    {
      icon: BarChart3,
      title: 'Custom Dashboards',
      description: 'Build unlimited custom dashboards tailored to each department and role in your organization.',
      color: 'from-indigo-500 to-purple-500',
      delay: '500ms'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime SLA', icon: Shield },
    { value: '10M+', label: 'Data Points/Day', icon: BarChart3 },
    { value: '<100ms', label: 'Response Time', icon: Zap },
    { value: '256-bit', label: 'Encryption', icon: Lock }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, TitanBuild M&L',
      content: 'ElevareIQ transformed our operations. The predictive analytics alone saved us $2M in the first quarter.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'COO, Global Manufacturing Inc',
      content: 'The most sophisticated analytics platform we\'ve ever used. The ROI was immediate and substantial.',
      rating: 5
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Chief Data Officer, Fortune 500',
      content: 'Finally, a platform that matches our ambitions. The AI insights are genuinely revolutionary.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background with Parallax */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"
          style={{
            top: '10%',
            left: `${20 + mousePosition.x * 0.01}%`,
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
          style={{
            top: '50%',
            right: `${10 + mousePosition.y * 0.01}%`,
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-3xl"
          style={{
            bottom: '10%',
            left: `${30 + mousePosition.x * 0.005}%`,
            transform: `translateY(${scrollY * -0.2}px)`
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <ElevareLogo variant="dark" size="xl" />

              <div className="flex items-center gap-8">
                <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium">Features</a>
                <a href="#security" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium">Security</a>
                <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium">Testimonials</a>
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105"
                >
                  Launch Platform
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm animate-pulse-slow"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Powered by Advanced AI</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-7xl md:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  Enterprise Analytics
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Transform raw data into strategic intelligence. ElevareIQ delivers
                <span className="text-cyan-400 font-semibold"> AI-powered insights </span>
                that drive decisions, reduce risks, and accelerate growth.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-6 pt-8">
                <Link
                  to="/"
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-105 flex items-center gap-3"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all hover:scale-105"
                >
                  Watch Demo
                </a>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 transition-all hover:scale-105 group"
                  >
                    <stat.icon className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                  Built for Excellence
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Enterprise-grade features that set new industry standards
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    animationDelay: feature.delay,
                    transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`
                  }}
                >
                  {/* Icon with Gradient Background */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity -z-10`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }} />
              </div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 mb-6">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Enterprise-Grade Security</span>
                  </div>

                  <h2 className="text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                      Fort Knox Security
                    </span>
                  </h2>
                  <p className="text-xl text-gray-400 mb-8">
                    Your data is protected by the same security infrastructure trusted by Fortune 500 companies worldwide.
                  </p>

                  <div className="space-y-4">
                    {[
                      'SOC 2 Type II Certified',
                      'GDPR & HIPAA Compliant',
                      '256-bit AES Encryption',
                      'Zero-Knowledge Architecture',
                      'Multi-Factor Authentication',
                      '24/7 Security Monitoring'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  {/* Animated Security Visualization */}
                  <div className="relative w-full aspect-square">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-spin-slow" />
                    <div className="absolute inset-8 rounded-full border-2 border-blue-500/30 animate-spin-reverse" />
                    <div className="absolute inset-16 rounded-full border-2 border-purple-500/30 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-24 h-24 text-cyan-400 animate-pulse-slow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                  Trusted by Leaders
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Join thousands of executives making data-driven decisions
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-gradient-x" />

              <div className="relative z-10">
                <h2 className="text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                    Ready to Transform Your Business?
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join the data revolution. Start your free 30-day trial today.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-105 group"
                >
                  Get Started Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
                <p className="text-sm text-gray-400 mt-4">
                  No credit card required • Free 30-day trial • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <ElevareLogo variant="dark" size="lg" />
                <p className="text-gray-400 text-sm mt-2">
                  Enterprise Analytics Reimagined
                </p>
              </div>
              <div className="text-center text-gray-400 text-sm">
                © 2024 ElevareIQ. All rights reserved. •
                <span className="text-cyan-400 ml-2">SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

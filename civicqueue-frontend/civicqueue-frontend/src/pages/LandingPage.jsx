import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Ticket,
  Clock,
  BarChart3,
  Bell,
  QrCode,
  ArrowRight,
  Building2,
  Zap,
  Calendar,
} from 'lucide-react'

const features = [
  {
    icon: Ticket,
    title: 'Smart Tokens',
    desc: 'Get queue tokens instantly with QR codes. No more standing in lines.',
  },
  {
    icon: Clock,
    title: 'Live Wait Times',
    desc: 'Know exactly how long your wait is with real-time estimated times.',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    desc: 'Get notified when your turn is approaching via in-app notifications.',
  },
  {
    icon: Calendar,
    title: 'Book Appointments',
    desc: 'Pre-schedule visits to skip the queue and choose your time slot.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Government offices can optimize staffing with detailed insights.',
  },
  {
    icon: QrCode,
    title: 'QR Verification',
    desc: 'Instant token verification with scannable QR codes at counters.',
  },
]

const stats = [
  { value: '24/7', label: 'Online queue access' },
  { value: '10+', label: 'Integrated departments' },
  { value: '3 Roles', label: 'Citizen, Staff & Admin' },
  { value: '100%', label: 'Digital service workflow' },
]

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 glassmorphism border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <img
              src="/civicQueue.png"
              alt="CivicQueue Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-[var(--text-primary)]">
              CivicQueue
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>

        </div>
      </nav>

       {/* HERO */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">

        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-civic-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950/50 text-civic-600 dark:text-civic-400 text-sm font-medium mb-8"
          >
            <Zap className="w-3.5 h-3.5" />
            India's smartest civic queue system
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] leading-tight tracking-tight mb-6"
          >
            No more <span className="text-gradient">standing</span>
            <br />
            in government lines
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10"
          >
            CivicQueue brings digital queue management to government offices.
            Book tokens, track wait times, and get served — all from your phone.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 rounded-xl"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin-login"
              className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2 rounded-xl"
            >
              <Building2 className="w-4 h-4" /> For offices
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-gradient">{s.value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              variants={fade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-4xl font-bold text-[var(--text-primary)] mb-4"
            >
              Everything you need
            </motion.h2>

            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              A complete platform for citizens and government offices to manage queues efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 hover:shadow-card-lg transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="w-11 h-11 rounded-2xl bg-civic-50 dark:bg-civic-950/40 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-civic-600 dark:text-civic-400" />
                </div>

                <h3 className="text-base font-bold mb-2">
                  {f.title}
                </h3>

                <p className="text-sm text-[var(--text-secondary)]">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-civic-500/5 to-violet-500/5" />

          <div className="relative">
            <h2 className="text-4xl font-bold mb-4">
              Ready to skip the line?
            </h2>

            <p className="mb-8 text-[var(--text-secondary)]">
              Join thousands of citizens using CivicQueue.
            </p>

            <Link
              to="/register"
              className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2 rounded-xl"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src="/civicQueue.png"
            alt="CivicQueue Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="font-bold text-sm">CivicQueue</span>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          © 2026 CivicQueue. Empowering citizens through digital governance.
        </p>
      </footer>

    </div>
  )
}
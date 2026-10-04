import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Compass, Target, Code, Shield, Database, Cpu, Cloud, PenTool, Lightbulb } from "lucide-react";
import { categoryColors } from "@/lib/colors";

const categories = [
  { name: "Software Development", icon: Code, desc: "Build applications and systems" },
  { name: "Cybersecurity", icon: Shield, desc: "Protect data and networks" },
  { name: "Data Science", icon: Database, desc: "Extract insights from complex data" },
  { name: "Artificial Intelligence", icon: Cpu, desc: "Create intelligent agents" },
  { name: "Cloud Computing", icon: Cloud, desc: "Architect scalable infrastructure" },
  { name: "UI/UX Design", icon: PenTool, desc: "Craft intuitive digital experiences" },
  { name: "Entrepreneurship", icon: Lightbulb, desc: "Build and scale new ventures" },
];

export default function Home() {
  return (
    <div className="w-full flex flex-col pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8"
          >
            <Compass className="mr-2 h-4 w-4" />
            Your Personal Career GPS
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-foreground mb-6"
          >
            Stop guessing about <span className="text-primary">your future.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
          >
            Take our precise aptitude assessment to uncover the careers you're actually wired for. Get a personalized roadmap to bridge your skill gaps.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Button size="lg" className="h-14 px-8 text-lg font-medium rounded-full" asChild>
              <Link href="/register">Start Your Assessment <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-full" asChild>
              <Link href="/careers">Explore Careers</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card border-y">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">From confusion to clarity in 3 steps</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A systematic approach to finding and securing your ideal role.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { icon: Brain, title: "1. Take the Assessment", desc: "A robust quiz mapping your cognitive strengths and core interests." },
              { icon: Target, title: "2. View Your Matches", desc: "Get algorithmic career matches scored by precision percentage." },
              { icon: Code, title: "3. Close the Gap", desc: "Follow a curated roadmap of courses to acquire missing skills." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">High-growth fields</h2>
              <p className="text-muted-foreground text-lg max-w-xl">We analyze paths in the industries shaping tomorrow.</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/careers">View all paths <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const colorClass = categoryColors[cat.name] || "bg-slate-100 text-slate-700 border-slate-200";
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl border ${colorClass.split(" ")[2]} bg-card hover:shadow-md transition-shadow group cursor-pointer`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass.split(" ")[0]} ${colorClass.split(" ")[1]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">{cat.name}</h3>
                  <p className="text-muted-foreground text-sm">{cat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Ready to map your future?</h2>
          <p className="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of students finding their precise career trajectory with CareerPathr.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-medium rounded-full text-primary" asChild>
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

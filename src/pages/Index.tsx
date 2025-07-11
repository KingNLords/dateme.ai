import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Sparkles,
  Users,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import logoT from "@/assets/Asset 4.png";
const Index = () => {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div className="flex space-x-2 mb-6">
          <span className="w-4 h-4 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
          <span className="w-4 h-4 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
          <span className="w-4 h-4 bg-pink-400 rounded-full animate-bounce"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-romantic dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-2 py-3 sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm transition-colors">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="w-20 ml-2 h-8 flex items-center justify-center">
              <img
                src={logoT}
                alt="logo"
                className="w-20 h-8 "
              />
            </div>
            {/* <h2 className="font-semibold text-gray-800 dark:text-white">
              Dateme.ai
            </h2> */}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Link to="/login">
              <Button
                variant="outline"
                className="border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300 dark:hover:bg-pink-900/20"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          Your AI-Powered Long-Distance Relationship Assistant
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Strengthen your bond with personalized advice, smart conversations,
          and thoughtful reminders.
        </p>
        <Link to="/signup">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg px-8 py-4"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Everything You Need for Love
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered features help you maintain and strengthen your
              relationship every day
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Smart Conversations",
                description:
                  "AI that understands emotions and responds with empathy",
              },
              {
                icon: Heart,
                title: "Love Vault",
                description:
                  "Save and organize your most precious memories together",
              },
              {
                icon: Sparkles,
                title: "Mood Detection",
                description:
                  "Automatic mood analysis to provide perfect responses",
              },
              {
                icon: Users,
                title: "Relationship Goals",
                description: "Personalized advice based on your love language",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Ready to Transform Your Love Life?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of couples who are already using Dateme.ai to
              strengthen their relationships
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg px-8 py-4"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-pink-100 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-15 h-8 flex items-center justify-center">
              <img
                src={logoT}
                alt="logo"
                className="w-15 h-8 "
              />
            </div>
            {/* <span className="text-xl font-bold text-gray-800 dark:text-white">
              Dateme.ai
            </span> */}
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">
            © 2024 Dateme.ai. Made with ❤️ for loving couples everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

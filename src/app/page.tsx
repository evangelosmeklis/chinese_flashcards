import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with improved design */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 md:py-28">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-8">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-2">
              Learn Chinese Easily
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Master <span className="text-blue-600 relative">Chinese</span> with Smart Flashcards
            </h1>
            <p className="text-xl text-gray-700">
              Accelerate your Chinese learning journey through customized spaced repetition 
              and intelligent study tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/flashcards">
                <Button className="text-lg py-6 px-8 bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Start Learning
                </Button>
              </Link>
              <Link href="/decks">
                <Button variant="outline" className="text-lg py-6 px-8 border-2 hover:bg-blue-50 transition-all">
                  Browse Decks
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg h-96 md:h-[450px]">
              {/* Animated blob background */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              
              {/* Card stack effect */}
              <div className="absolute top-4 right-4 w-64 h-72 bg-white rounded-xl shadow-md transform rotate-6"></div>
              <div className="absolute top-2 right-2 w-64 h-72 bg-white rounded-xl shadow-md transform rotate-3"></div>
              
              {/* Main flashcard */}
              <div className="relative bg-white rounded-xl shadow-xl p-8 flex items-center justify-center h-72 backdrop-blur-sm border border-white/20 transform transition-all hover:-translate-y-1 hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-7xl mb-4 font-bold text-blue-800">你好</div>
                  <div className="text-xl mb-2 text-blue-600">nǐ hǎo</div>
                  <div className="text-2xl font-medium">Hello</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - New */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600">Chinese Characters</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600">Study Modes</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Available Anytime</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Improved */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent system makes learning Chinese characters efficient and enjoyable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Create Flashcards</h3>
              <p className="text-gray-600">
                Add Chinese characters with pinyin pronunciation and English meaning. Tag your cards for better organization.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Build Custom Decks</h3>
              <p className="text-gray-600">
                Create decks by adding cards manually or based on tags. Organize your learning by levels, topics, or any system you prefer.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Study & Track Progress</h3>
              <p className="text-gray-600">
                Learn in different modes: character to meaning, meaning to character, or meaning only. Track your progress and focus on challenging cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Section - Redesigned */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Study Modes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn Your Way</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from multiple study modes to optimize your learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center p-6 transform transition-transform hover:scale-110">
                  <div className="text-5xl mb-2 font-bold text-blue-800">学习</div>
                  <div className="text-lg opacity-0">xué xí</div>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-xl font-bold mb-2">Normal Mode</h3>
                <p className="text-gray-600">
                  See the Chinese character, guess the pronunciation and meaning, then flip to check your answer.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center p-6 transform transition-transform hover:scale-110">
                  <div className="text-lg mb-2 font-medium text-blue-700">xué xí</div>
                  <div className="text-lg font-medium">study, learn</div>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-xl font-bold mb-2">Reverse Mode</h3>
                <p className="text-gray-600">
                  See the pinyin and meaning, practice writing or recalling the Chinese character.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center p-6 transform transition-transform hover:scale-110">
                  <div className="text-lg mb-2 font-medium">study, learn</div>
                  <div className="text-lg opacity-0">学习</div>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-xl font-bold mb-2">Meaning Only</h3>
                <p className="text-gray-600">
                  See only the English meaning, recall both the character and its pronunciation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - New */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Students Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied learners who have improved their Chinese skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Michael T.</h4>
                  <p className="text-sm text-gray-500">Chinese Student</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"This app has been a game-changer for my Chinese studies. The spaced repetition system helps me remember characters much longer."</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sarah L.</h4>
                  <p className="text-sm text-gray-500">Business Professional</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"I've tried many flashcard apps, but this one stands out with its clean interface and multiple study modes. Perfect for busy professionals."</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">James W.</h4>
                  <p className="text-sm text-gray-500">Language Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The ability to create custom decks and organize with tags makes this tool extremely flexible for learning exactly what I need."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your Chinese journey?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-blue-100">
            Join thousands of learners who are efficiently mastering Chinese characters with our intelligent flashcard system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/flashcards">
              <Button className="text-lg py-6 px-8 bg-white text-blue-700 hover:bg-blue-50 transition-all">
                Create Flashcards
              </Button>
            </Link>
            <Link href="/decks">
              <Button variant="outline" className="text-lg py-6 px-8 border-2 border-white text-white hover:bg-blue-700 transition-all">
                Browse Decks
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

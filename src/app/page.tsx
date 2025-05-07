import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Learn Chinese <span className="text-blue-600">Effectively</span> with Flashcards
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Master Chinese characters, pinyin, and meanings through customized spaced repetition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/flashcards">
                <Button className="text-lg py-6 px-8">Get Started</Button>
              </Link>
              <Link href="/decks">
                <Button variant="outline" className="text-lg py-6 px-8">
                  Explore Decks
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg h-80 md:h-96">
              <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              <div className="relative bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">你好</div>
                  <div className="text-xl mb-2">nǐ hǎo</div>
                  <div className="text-2xl font-medium">Hello</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
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
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
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
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
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

      {/* Modes Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Study Your Way</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="aspect-video bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">学习</div>
                  <div className="text-lg opacity-0">xué xí</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Normal Mode</h3>
              <p className="text-gray-600">
                See the Chinese character, guess the pronunciation and meaning, then flip to check your answer.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="aspect-video bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-lg mb-2">xué xí</div>
                  <div className="text-lg">study, learn</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Reverse Mode</h3>
              <p className="text-gray-600">
                See the pinyin and meaning, practice writing or recalling the Chinese character.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="aspect-video bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-lg mb-2">study, learn</div>
                  <div className="text-lg opacity-0">学习</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Meaning Only</h3>
              <p className="text-gray-600">
                See only the English meaning, recall both the character and its pronunciation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to start learning Chinese?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of learners who are efficiently mastering Chinese characters with our flashcard system.
          </p>
          <Link href="/flashcards">
            <Button className="text-lg py-6 px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

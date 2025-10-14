"use client";

import Image from 'next/image';

export default function HomeSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center text-center relative hero-grid"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
          <div className="absolute top-60 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>

        <div className="animate-fade-in relative z-10">
          <div className="mb-8">
            <Image
              style={{
                filter: "invert(1)",
              }}
              width={900}
              height={1000}
              src="images/Logo-tr.png"
              alt="Logo"
            />
          </div>

          <h1 className="text-6xl md:text-xl lg:text-5xl font-bold gradient-text tracking-tight leading-none mb-0">
            Anand Rathi Tinkerers' Lab
          </h1>

          <h2 className="text-2xl md:text-2xl text-gray-300 mb-4 font-light">
            Innovation Hub
          </h2>

          <p className="text-xl text-blue-400 font-medium mb-12">IIT Jodhpur</p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin:10,
              padding:10
            }}
          >
              Sponsored by
            <Image style={{
              marginLeft: 10
            }} width={100} height={200} src="images/maker-logo.png" alt="maker logo"/>
          </div>
        </div>
      </div>
    </section>
  );
}

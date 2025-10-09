export default function AboutSection() {
  return (
    <section id="about" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            About Anand Rathi Tinkering Lab
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            A premier innovation ecosystem fostering technological advancement and research excellence
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="sleek-card rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To establish a world-class innovation hub that bridges the gap between academic research 
                and industrial application, fostering breakthrough technologies that address global challenges.
              </p>
            </div>
            
            <div className="sleek-card rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Empowering researchers, students, and industry partners with state-of-the-art facilities, 
                expert mentorship, and collaborative opportunities to drive innovation and technological progress.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { number: '500+', label: 'Active Researchers', color: 'text-blue-400' },
              { number: '150+', label: 'Projects Completed', color: 'text-purple-400' },
              { number: '75+', label: 'Industry Partnerships', color: 'text-green-400' },
              { number: '25+', label: 'Patents Filed', color: 'text-yellow-400' },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="sleek-card rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-300 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
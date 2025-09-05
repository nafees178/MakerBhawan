"use client";

import { Linkedin, Mail, Github } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Person 1',
    role: 'Director',
    department: 'Mechanical Engineering',
    image: 'https://via.placeholder.com/200x200/333333/ffffff?text=P1',
    bio: 'Leading research in advanced manufacturing, robotics, and sustainable technologies',
    social: {
      linkedin: '#',
      email: 'person1@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 2,
    name: 'Person 2',
    role: 'Research Head',
    department: 'Computer Science & AI',
    image: 'https://via.placeholder.com/200x200/333333/ffffff?text=P2',
    bio: 'Expert in artificial intelligence, machine learning, and intelligent systems',
    social: {
      linkedin: '#',
      email: 'person2@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 3,
    name: 'Person 3',
    role: 'Technical Lead',
    department: 'Electrical Engineering',
    image: 'https://via.placeholder.com/200x200/333333/ffffff?text=P3',
    bio: 'Specializing in power systems, renewable energy, and smart grid technologies',
    social: {
      linkedin: '#',
      email: 'person3@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 4,
    name: 'Person 4',
    role: 'Innovation Manager',
    department: 'Biomedical Engineering',
    image: 'https://via.placeholder.com/200x200/333333/ffffff?text=P4',
    bio: 'Bridging healthcare technology with engineering innovation and research',
    social: {
      linkedin: '#',
      email: 'person4@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 5,
    name: 'Person 5',
    role: 'Senior Researcher',
    department: 'Electronics & Communication',
    image: 'https://via.placeholder.com/200x200/333333/ffffff?text=P5',
    bio: 'Focused on embedded systems, IoT solutions, and wireless communication',
    social: {
      linkedin: '#',
      email: 'person5@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 6,
    name: 'Person 6',
    role: 'Operations Manager',
    department: 'Industrial Design',
    image: 'https://via.placeholder.com/200x200/333333/ffffff?text=P6',
    bio: 'Expert in design thinking, project management, and innovation processes',
    social: {
      linkedin: '#',
      email: 'person6@iitj.ac.in',
      github: '#'
    }
  }
];

export default function TeamSection() {
  return (
    <section id="team" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            Leadership Team
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Distinguished researchers and innovators driving technological advancement
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="team-card sleek-card rounded-2xl p-8 transition-all duration-300"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-2 ring-gray-700">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="sleek-card px-4 py-2 rounded-full">
                    <span className="text-sm text-blue-400 font-medium">
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {member.department}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed mb-8">
                  {member.bio}
                </p>

                <div className="flex justify-center space-x-4">
                  <a
                    href={member.social.linkedin}
                    className="p-3 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:scale-110 transition-all duration-300"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href={`mailto:${member.social.email}`}
                    className="p-3 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:scale-110 transition-all duration-300"
                  >
                    <Mail size={18} />
                  </a>
                  <a
                    href={member.social.github}
                    className="p-3 rounded-lg bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:scale-110 transition-all duration-300"
                  >
                    <Github size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
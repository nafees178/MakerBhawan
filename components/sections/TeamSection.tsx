"use client";

import { Linkedin, Mail, Github } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Yash Golani',
    role: 'General Secretary ACAC',
    department: 'Student Affairs',
    image: '/images/team/yash.jpeg',
    bio: 'General Secretary ACAC',
    social: {
      linkedin: 'https://www.linkedin.com/in/yash-golani-144210106/',
      email: 'gensecy_acac@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 2,
    name: 'Tharakadatta G Hegde',
    role: 'General Secretary SS',
    department: 'Student Affairs',
    image: '/images/team/tharak.jpeg',
    bio: 'General Secretary SS',
    social: {
      linkedin: 'https://www.linkedin.com/in/tharakadattahegde/',
      email: 'gensecy_ss@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 3,
    name: 'Manas Chechani',
    role: 'General Secretary SAC',
    department: 'Student Affairs',
    image: '/images/team/manas.jpeg',
    bio: 'General Secretary SAC',
    social: {
      linkedin: 'https://www.linkedin.com/in/manas-chechani-1452ab253/',
      email: 'gensecy_sac@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 4,
    name: 'Sambhav Jha',
    role: 'VP BCCA',
    department: 'Student Affairs',
    image: '/images/team/sambhav.jpeg',
    bio: 'Vice President of BCCA',
    social: {
      linkedin: 'https://www.linkedin.com/in/sambhav-jha-61412528a/',
      email: 'b23ee1092@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 5,
    name: 'Dhruva Kumar Kaushal',
    role: 'Coordinating Team',
    department: 'Student Team',
    image: '/images/team/dhruva.jpeg',
    bio: 'Member of the Coordinating Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/dhruvakkaushal/',
      email: 'b22ai017@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 6,
    name: 'Rhythm Baghel',
    role: 'Coordinating Team',
    department: 'Student Team',
    image: '/images/team/rhythm.jpeg',
    bio: 'Member of the Coordinating Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/rhythm-baghel-80675a25a/',
      email: 'b22cs042@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 7,
    name: 'Anuj Patil',
    role: 'Coordinating Team',
    department: 'Student Team',
    image: '/images/team/anuj.jpeg',
    bio: 'Member of the Coordinating Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/anuj-vijay-patil/',
      email: 'b22ee010@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 8,
     name: 'Mrudhul Tula',
    role: 'Core Team',
    department: 'Student Team',
    image: '/images/team/mrudhul.jpeg',
    bio: 'Member of the Core Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/tula-mrudhul/',
      email: 'b23ee1076@iitj.ac.in',
      github: '#'

    }
  },
  {
    id: 9,
    name: 'Sohom Sarkar',
    role: 'Core Team',
    department: 'Student Team',
    image: '/images/team/sohom.jpeg',
    bio: 'Member of the Core Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/sohom-sarkar-598b9b2aa/',
      email: 'b23ee1099@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 10,
    name: 'Agam Harpreet Singh',
    role: 'Core Team',
    department: 'Student Team',
    image: '/images/team/agam.jpeg',
    bio: 'Member of the Core Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/agam-harpreet-singh/',
      email: 'b23cm1004@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 11,
    name: 'Goutham A.S',
    role: 'Core Team',
    department: 'Student Team',
    image: '/images/team/goutham.jpeg',
    bio: 'Member of the Core Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/goutham-a-s-93b30b312/overlay/contact-info/',
      email: 'b23ee1024@iitj.ac.in',
      github: '#'
    }
  },
  {
    id: 12,
    name: 'Tashir Ahmed',
    role: 'Core Team',
    department: 'Student Team',
    image: '/images/team/tashir.jpeg',
    bio: 'Member of the Core Team',
    social: {
      linkedin: 'https://www.linkedin.com/in/tashir-ahmed-5315b128b/',
      email: 'b23me1074@iitj.ac.in',
      github: '#'
    }
  },
  // {
  //   id: 12,
  //   name: 'Raghuveer Kulkarni',
  //   role: 'Core Team',
  //   department: 'Student Team',
  //   image: '/images/team/raghuveer.jpeg',
  //   bio: 'Member of the Core Team',
  //   social: {
  //     linkedin: 'https://www.linkedin.com/in/raghuveer-kulkarni-185450281/',
  //     email: 'b23es1020@iitj.ac.in',
  //   github: '#'
  //   }
  // },
  // {
  //   id: 13,
  //   name: 'Pragay',
  //   role: 'Core Team',
  //   department: 'Student Team',
  //   image: 'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
  //   bio: 'Member of the Core Team',
  //   social: {
  //     linkedin: '#',
  //     email: 'pragay@example.com',
  //     github: '#'
  //   }
  // },
  // {
  //   id: 14,
  //   name: 'Nisarg Upadhyaya',
  //   role: 'Core Team',
  //   department: 'Student Team',
  //   image: 'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
  //   bio: 'Member of the Core Team',
  //   social: {
  //     linkedin: '#',
  //     email: 'nisarg@example.com',
  //     github: '#'
  //   }
  // },
  // {
  //   id: 15,
  //   name: 'Aradhya Mahajan',
  //   role: 'Core Team',
  //   department: 'Student Team',
  //   image: 'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
  //   bio: 'Member of the Core Team',
  //   social: {
  //     linkedin: '#',
  //     email: 'aradhya@example.com',
  //     github: '#'
  //   }
  // },
  
];

export default function TeamSection() {
  return (
    <section id="team" className="section-padding ">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            Leadership Team
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Distinguished researchers and innovators driving technological advancement
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="team-card sleek-card rounded-2xl p-8 transition-all duration-300 w-[350px]"
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
                  <div className="sleek-card px-4 py-2 rounded-full flex items-center justify-center text-center">
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

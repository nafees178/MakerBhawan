"use client";

import { Printer, Cpu, Wrench, Microscope, Wifi, Zap } from 'lucide-react';

const facilities = [
  {
    icon: Printer,
    title: 'Advanced Manufacturing',
    description: 'Industrial-grade 3D printers, CNC machines, and precision manufacturing tools',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10'
  },
  {
    icon: Cpu,
    title: 'Electronics & Computing',
    description: 'High-performance computing clusters, PCB fabrication, and embedded systems lab',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10'
  },
  {
    icon: Wrench,
    title: 'Mechanical Workshop',
    description: 'Precision machining, materials testing, and mechanical design facilities',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  },
  {
    icon: Microscope,
    title: 'Research Laboratory',
    description: 'Advanced characterization tools, clean room facilities, and analytical equipment',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  },
  {
    icon: Wifi,
    title: 'IoT & Connectivity',
    description: 'Smart systems development, wireless communication, and network infrastructure',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10'
  },
  {
    icon: Zap,
    title: 'Energy Systems',
    description: 'Renewable energy research, power electronics, and energy storage solutions',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10'
  },
];

export default function FacilitiesSection() {
  return (
    <section id="facilities" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            World-Class Facilities
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            State-of-the-art infrastructure designed to support cutting-edge research and innovation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => {
            const Icon = facility.icon;
            return (
              <div
                key={facility.title}
                className="facility-card sleek-card rounded-2xl p-8 hover:scale-105 transition-all duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`${facility.bgColor} rounded-xl p-4 w-fit mb-6`}>
                  <Icon className={`${facility.color} facility-icon size-8`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {facility.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {facility.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
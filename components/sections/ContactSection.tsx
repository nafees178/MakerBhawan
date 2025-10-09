"use client";

import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            Contact Us
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Connect with us to explore collaboration opportunities and research partnerships
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="sleek-card rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8">Get In Touch</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-xl bg-blue-600/20 text-blue-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-lg">Email</h4>
                    <p className="text-gray-300">makerbhawan@iitj.ac.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-xl bg-green-600/20 text-green-400">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-lg">Phone</h4>
                    <p className="text-gray-300">+91 XXXXXXXXXX</p>
                    <p className="text-gray-300">+91 XXXXXXXXXX</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-xl bg-purple-600/20 text-purple-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-lg">Address</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Anand Rathi Tinkering Lab, IIT Jodhpur<br />
                      NH 65, Nagaur Road<br />
                      Karwar, Jodhpur - 342030<br />
                      Rajasthan, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sleek-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Operating Hours</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
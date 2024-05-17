import React from 'react';
import Image from 'next/image';
import { Facebook,Instagram } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-sm">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Use flex and define flex-wrap for responsiveness */}
        <div className="flex flex-wrap justify-between space-x-8">
          {/* First Column */}
          <div className="flex-1">
            <h3 className="text-white uppercase mb-2">General Lessons</h3>
            <ul>
              <li><a href="/generallessons" className="hover:underline">General Lessons</a></li>
              <li><a href="/seattle-programs" className="hover:underline">Seattle Programs</a></li>
              <li><a href="/resources" className="hover:underline">Resources</a></li>
              <li><a href="/staff" className="hover:underline">Staff</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/contact" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>

          {/* Second Column */}
          <div className="flex-1">
            <h3 className="text-white uppercase mb-2">More Info</h3>
            <ul>
              <li><a href="/calendar" className="hover:underline">Calendar</a></li>
              <li><a href="/warranty" className="hover:underline">Warranty Information</a></li>
              <li><a href="/risk" className="hover:underline">Assumption of Risk and Liability Release</a></li>
              <li><a href="/donations" className="hover:underline">Donations</a></li>
              <li><a href="/scholarship" className="hover:underline">Maria Jose Scholarship</a></li>
            </ul>
          </div>

          {/* Third Column */}
          <div className="flex-1">
            <h3 className="text-white uppercase mb-2">Connect With Us</h3>
            <div className="flex items-center space-x-4 mb-4">
              {/* Social Links */}
              <a href="https://www.facebook.com/SkiMohan/" target="_blank" rel="noopener noreferrer"><Facebook/></a>
              <a href="https://www.instagram.com/skimohan/" target="_blank" rel="noopener noreferrer"><Instagram/></a>
              {/* ... other social icons */}
            </div>
          </div>

          {/* Fourth Column */}
          <div className="flex-1 ">
          <Image
                  src="/us_forest_service_reverse.png" // Assuming the logo is directly inside the public folder
                  alt="Partners in winter Recreation"
                  width={300} // The width of your logo
                  height={300} // The height of your logo
                  layout="intrinsic" // Maintains the image dimensions
                />
            <p className="text-gray-400 text-xs p-3">
              This program provides employment, services, and privileges regardless of race, color, creed,
              sex, religion, age or national origin.
            </p>
          </div>
        </div>

        <div className="text-center text-gray-400 mt-6 border-t border-gray-700 pt-4">
          &copy; 2024 Mohan Ski School LLC, All Rights Reserved
          <br />
          created by Daniel Schaaf
        </div>
      </div>
    </footer>
  );
};

export default Footer;

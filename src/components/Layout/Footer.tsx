import React from 'react';
import { Github, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full border-t border-dashed border-[#38a169]/30 py-8 px-4 mt-10 bg-gradient-to-b from-transparent to-[#e8f5e1]">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              © {new Date().getFullYear()} Nodeviz
            </span>
            <span className="hidden sm:inline text-sm text-gray-500">• Building better graph visualizations</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors hover:underline"
              aria-label="GitHub"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
            
            <span className="text-sm text-gray-600 mx-1">•</span>
            
            <Link
              to="/team"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors hover:underline"
              aria-label="Meet the Team"
            >
              <Users size={16} />
              <span>Meet the Team</span>
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
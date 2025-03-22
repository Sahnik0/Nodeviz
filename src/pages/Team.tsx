import React from 'react';
import { ArrowLeft, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  imagePath: string;
  links?: {
    github?: string;
    linkedin?: string;
  };
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio, imagePath, links }) => {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl border border-dashed border-[#38a169]/30 transition-all hover:shadow-lg hover:translate-y-1 group">
      <div className="relative w-36 h-36 rounded-full overflow-hidden mb-5 border-2 border-[#38a169]/30 shadow-md group-hover:border-[#38a169]/70 transition-all">
        <img 
          src={imagePath} 
          alt={`${name}'s profile`} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
      <p className="text-sm text-[#38a169] font-medium mb-3 px-4 py-1 bg-[#38a169]/10 rounded-full">{role}</p>
      <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">{bio}</p>
      
      <div className="flex gap-4">
        {links?.github && (
          <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Github size={18} className="text-gray-700 hover:text-black transition-colors" />
          </a>
        )}
        {links?.linkedin && (
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Linkedin size={18} className="text-gray-700 hover:text-[#0077b5] transition-colors" />
          </a>
        )}
      </div>
    </div>
  );
};

const Team = () => {
  const teamMembers: TeamMemberProps[] = [
    {
      name: "Sahnik Biswas",
      role: "Team Lead",
      bio: "Full-stack developer with expertise in both frontend and backend development, specializing in modern web technologies.",
      imagePath: "/sahnik.jpg",
      links: {
        github: "https://github.com/Sahnik0",
        linkedin: "https://linkedin.com/in/sahnik-biswas"
      }
    },
    {
      name: "Sankalpa Sarkar",
      role: "Full Stack Developer",
      bio: "Full-stack developer skilled in building end-to-end web applications with modern JavaScript frameworks.",
      imagePath: "/sankalpa.jpg",
      links: {
        github: "https://github.com/sankalpasarkar",
        linkedin: "https://linkedin.com/in/sankalpa-sarkar"
      }
    },
    {
      name: "Shreyas Saha",
      role: "Algorithm Specialist",
      bio: "Expert in pathfinding algorithms and graph theory with a passion for education.",
      imagePath: "/shreyas.jpg",
      links: {
        github: "https://github.com/shreyassaha",
        linkedin: "https://linkedin.com/in/shreyas-saha"
      }
    },
    {
      name: "Aninda Debta",
      role: "AI Developer",
      bio: "React specialist focused on creating interactive and responsive web applications.",
      imagePath: "/aninda1.jpg",
      links: {
        github: "https://github.com/anindadebta",
        linkedin: "https://linkedin.com/in/aninda-debta"
      }
    },
    {
      name: "Srijita Bera",
      role: "Backend Developer",
      bio: "Skilled in Node.js and database architecture with experience in high-performance systems.",
      imagePath: "/srijita.jpg",
      links: {
        github: "https://github.com/srijiiii",
        linkedin: "https://www.linkedin.com/in/srijita-bera-ab5578291"
      }
    },
    {
      name: "Aishi Mahapatra",
      role: "Frontend Developer",
      bio: "Ensuring high-quality software through comprehensive testing and performance analysis.",
      imagePath: "/aishi.jpg",
      links: {
        github: "https://github.com/aishimahapatra",
        linkedin: "https://linkedin.com/in/aishi-mahapatra"
      }
    },
    {
      name: "Purabi Malakar",
      role: "UI/UX",
      bio: "Managing infrastructure and optimizing deployment pipelines for seamless application delivery.",
      imagePath: "/purabi.jpg",
      links: {
        github: "https://github.com/Purabimalakar/Purabimalakar",
        linkedin: "https://www.linkedin.com/in/purabi-malakar-b8b7052b9"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2FCE2] to-white pt-8 pb-16">
      <div className="container mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-[#38a169] hover:text-[#2f855a] mb-8 transition-colors bg-white py-2 px-4 rounded-lg shadow-sm hover:shadow-md">
          <ArrowLeft size={18} className="mr-2" />
          <span>Back to Visualization</span>
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">Meet Our Team</h1>
          <div className="w-24 h-1 bg-[#38a169] mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">The brilliant minds behind Nodeviz, dedicated to making algorithm visualization easy, accessible, and enjoyable for everyone.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {teamMembers.map((member, index) => (
            <TeamMember key={index} {...member} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
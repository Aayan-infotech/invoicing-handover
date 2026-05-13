import React, { useState } from 'react';
import { ProjectList } from './ProjectList';
import { ProjectDetail } from './ProjectDetail';

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  
  return selectedProject ? (
    <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
  ) : (
    <ProjectList onOpen={(p) => setSelectedProject(p)} />
  );
}

export default Projects;
module.exports.convertProject = (project) => {
  // Convert the projects to the type definition of a Project
  return {
    projectName: project.projectName,
    owner: project.owner,
    users: project.users,
    createdAt: project.createdAt,
    id: project._id,
  };
};

module.exports.convertFile = (file) => {
  // Convert each file to the File schema
  return {
    id: file._id,
    fileName: file.fileName,
    projectId: file.projectId,
    data: file.data,
    createdAt: file.createdAt,
  };
};

module.exports.convertProjects = (projects) => {
  // Convert the projects to the type definition of a Project
  const result = projects.map((proj) => {
    return {
      projectName: proj.projectName,
      owner: proj.owner,
      users: proj.users,
      createdAt: proj.createdAt,
      id: proj._id,
    };
  });

  return result;
};

module.exports.convertFiles = (files) => {
  // Convert each file to the File schema
  const result = files.map((file) => {
    return {
      id: file._id,
      fileName: file.fileName,
      projectId: file.projectId,
      data: file.data,
      createdAt: file.createdAt,
    };
  });

  return result;
};

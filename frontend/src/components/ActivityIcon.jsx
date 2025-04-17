import React from 'react';
import { FaBook, FaClipboardList, FaFlask, FaLaptopCode, FaUserFriends } from 'react-icons/fa';
import { MdAssignment } from 'react-icons/md';

const ActivityIcon = ({ type, size = 24 }) => {
  switch (type?.toLowerCase()) {
    case 'tarea':
      return <MdAssignment size={size} color="var(--accent-color)" />;
    case 'examen':
      return <FaClipboardList size={size} color="var(--danger)" />;
    case 'laboratorio':
      return <FaFlask size={size} color="var(--info)" />;
    case 'proyecto':
      return <FaLaptopCode size={size} color="var(--success)" />;
    case 'grupo de estudio':
      return <FaUserFriends size={size} color="var(--secondary-color)" />;
    default:
      return <FaBook size={size} color="var(--primary-color)" />;
  }
};

export default ActivityIcon;
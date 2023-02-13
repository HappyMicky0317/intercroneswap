import { useLocation } from 'react-router-dom';

const Sample: React.FC = () => {
  const location = useLocation<Location>();

  const { pathname } = location;

  return <p style={{ color: 'white', fontSize: 30 }}>{pathname.replace(/[^A-Z0-9]/gi, '').toUpperCase()} Page</p>;
};

export default Sample;

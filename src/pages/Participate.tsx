import { Navigate } from 'react-router-dom';
import { ROLES } from '@/data/ecosystem';

// No card grid — open straight into the first audience's detail, where a navigator
// lets you jump between the ways to participate.
export function Participate() {
  return <Navigate to={`/participate/${ROLES[0].id}`} replace />;
}

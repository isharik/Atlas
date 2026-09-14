import { Navigate } from 'react-router-dom';
import { PROGRAMS } from '@/data/ecosystem';
import { slugify } from '@/lib/slug';

// No card grid — open straight into the first program's detail, where a navigator
// lets you jump between programs and browse the ecosystem partners.
export function Programs() {
  return <Navigate to={`/programs/${slugify(PROGRAMS[0].name)}`} replace />;
}

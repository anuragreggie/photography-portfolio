import { redirect } from 'react-router';

export function clientLoader() {
  throw redirect('/');
}

export default function AboutRedirect() {
  return null;
}

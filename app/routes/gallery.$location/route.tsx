import { redirect } from 'react-router';

export function clientLoader() {
  throw redirect('/gallery');
}

export default function LocationRedirect() {
  return null;
}

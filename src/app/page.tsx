import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
  //This return is for type consistency, redirect() will stop execution.
  return null;
}

import { redirect } from 'next/navigation';

export default function LabsAuthLoginPage() {
  redirect('/login?redirect=/labs/test-app/catalog');
}

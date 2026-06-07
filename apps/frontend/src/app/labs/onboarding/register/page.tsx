import { redirect } from 'next/navigation';

export default function LabsOnboardingRegisterPage() {
  redirect('/register?redirect=/labs/test-app/catalog');
}

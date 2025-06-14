import { notFound } from 'next/navigation'
import { db } from "@/lib/db"
import MemberEditForm from '@/components/form/MemberForm/MemberEditForm'
import { Member } from '@prisma/client'

async function getMember(id: string): Promise<Member> {
  const member = await db.member.findUnique({
    where: { id }
  });

  if (!member) {
    notFound();
  }

  return member;
}

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EditMemberPage({ params, searchParams }: PageProps) {
  const member = await getMember(params.id);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Member</h1>
      <MemberEditForm memberdata={member} />
    </div>
  );
}
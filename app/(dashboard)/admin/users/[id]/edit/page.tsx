import EditUserForm from "./_components/EditUserForm";

export const metadata = {
  title: "Edit User",
  description: "Edit user information",
};

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: EditUserPageProps) {
  return <EditUserForm userId={params.id} />;
}

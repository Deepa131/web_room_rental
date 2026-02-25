import EditUserForm from "./_components/EditUserForm";

export const metadata = {
  title: "Edit User",
  description: "Edit user information",
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edit User
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">Update user information</p>
        </div>

        {/* Form Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <EditUserForm userId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

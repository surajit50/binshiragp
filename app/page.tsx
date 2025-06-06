
import LoginForm from "@/components/auth/LoginForm";


const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col items-center justify-center py-4 px-2 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-4 px-2 ring-1 ring-gray-900/5 sm:rounded-xl sm:px-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

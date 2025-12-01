import { Mail, Lock } from 'lucide-react';

export default function WhitelistWall({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h1>
          <p className="text-gray-600">
            This application is currently in private beta
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-3">
            You've successfully signed in as:
          </p>
          <div className="flex items-center gap-3 mb-3">
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            However, your account needs to be whitelisted before you can access the application.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Request Access
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            To request access to this application, please contact:
          </p>
          <a
            href="mailto:justaryaid@gmail.com?subject=Whitelist Request for Chinese Learning App&body=Hi, I would like to request access to the Chinese Learning App.%0A%0AMy email: {user?.email}%0A%0AThank you!"
            className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Mail className="w-5 h-5" />
            <span>Email justaryaid@gmail.com</span>
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

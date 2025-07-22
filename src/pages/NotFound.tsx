import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Heart, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 flex flex-col items-center justify-center text-center p-6">
      <Heart className="text-pink-400 w-16 h-16 animate-pulse mb-4" />
      <h1 className="text-6xl font-extrabold text-pink-600 mb-2 drop-shadow">
        404
      </h1>
      <p className="text-2xl text-gray-700 mb-4 font-medium">
        Love couldn’t find this page
      </p>
      <p className="text-gray-500 mb-6 max-w-md">
        The page you’re looking for might have been moved, deleted, or never
        existed. But don’t worry—we’re still here to help you find your perfect
        match.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold transition shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back Home
      </a>
    </div>
  );
};

export default NotFound;

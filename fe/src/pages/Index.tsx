
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-teal-900">OLIVA</h1>
            <p className="text-teal-600 tracking-wider">SKIN • HAIR • BODY CLINIC</p>
          </div>
        </div>
        <p className="text-xl text-teal-700 mb-8">Payment Management System</p>
        <Button 
          onClick={() => navigate('/login')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
        >
          Login to Continue
        </Button>
      </div>
    </div>
  );
};

export default Index;

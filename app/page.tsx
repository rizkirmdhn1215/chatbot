import AIChat from './components/AIChat';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <Layout>
        <AIChat />
      </Layout>
    </ProtectedRoute>
  );
}

import TrainingInterface from '../components/TrainingInterface';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

export default function TrainingPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <TrainingInterface />
      </Layout>
    </ProtectedRoute>
  );
} 
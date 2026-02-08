import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/modules/auth/LoginPage';
import { NoticeListPage } from '@/modules/notices/NoticeListPage';
import { NoticeFormPage } from '@/modules/notices/NoticeFormPage';
import { GalleryListPage } from '@/modules/gallery/GalleryListPage';
import { GalleryFormPage } from '@/modules/gallery/GalleryFormPage';
import { ResourceUploadPage } from '@/modules/resources/ResourceUploadPage';
import { PledgeProgressPage } from '@/modules/pledge/PledgeProgressPage';
import { ActivityListPage } from '@/modules/activities/ActivityListPage';
import { ActivityFormPage } from '@/modules/activities/ActivityFormPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/notices"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoticeListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoticeFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoticeFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Layout>
                  <GalleryListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <GalleryFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <GalleryFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResourceUploadPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pledge"
            element={
              <ProtectedRoute>
                <Layout>
                  <PledgeProgressPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/notices" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

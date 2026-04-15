import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Topbar, RoleBadge } from '../components/UI';

export default function EtudiantDashboard() {
  const { user } = useAuth();

  return (
    <div className="dash-shell">
      <Topbar />

      <div className="page-body">

        {/* Header */}
        <div className="page-header">
          <p className="page-eyebrow anim-fade-up">Espace Étudiant</p>

          <h1 className="page-title anim-fade-up delay-1">
            Bienvenue, {user?.fullName?.split(' ')[0]} 📚
          </h1>

          <p className="page-sub anim-fade-up delay-2">
            Votre espace de suivi de projet de fin d'études.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid anim-fade-up delay-2">
          <div className="stat-card">
            <div className="stat-label">Votre rôle</div>
            <div style={{ marginTop: 8 }}>
              <RoleBadge role="ETUDIANT" />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Email</div>
            <div
              style={{
                fontSize: 14,
                marginTop: 6,
                color: 'var(--text-soft)',
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        {/* Project placeholder */}
        <div
          className="card anim-fade-up delay-3"
          style={{ textAlign: 'center', padding: '52px 32px' }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>

          <h3
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 10,
              letterSpacing: '-.02em',
            }}
          >
            Votre projet PFE
          </h3>

          <p
            style={{
              fontSize: 15,
              color: 'var(--text-soft)',
              marginBottom: 28,
              lineHeight: 1.7,
            }}
          >
            Suivez l'avancement de votre projet, soumettez des rapports et
            communiquez avec votre encadrant.
          </p>

          <Link to="/profile">
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: 'auto', margin: '0 auto' }}
            >
              Voir mon profil →
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
// @ts-check
import React from 'react';

/**
 * Reusable Webhook Health Status Badge with pulsing animation
 * @param {Object} props
 * @param {'healthy'|'degraded'|'failing'|string} props.status
 * @param {string} [props.label]
 */
export function WebhookStatusBadge({ status, label }) {
  const norm = (status || '').toLowerCase();
  const badgeClass =
    norm === 'healthy'
      ? 'bg-success'
      : norm === 'degraded'
        ? 'bg-warning text-dark'
        : 'bg-danger';

  return (
    <span className={`badge ${badgeClass} d-inline-flex align-items-center gap-1`}>
      <span className="spinner-grow spinner-grow-sm" style={{ width: '0.4rem', height: '0.4rem' }} />
      {label || norm.toUpperCase()}
    </span>
  );
}

/**
 * Severity Badge for incidents & technical activities
 * @param {Object} props
 * @param {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'|string} props.severity
 */
export function SeverityBadge({ severity }) {
  const norm = (severity || 'LOW').toUpperCase();
  let badgeClass = 'bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50';
  let icon = 'bi-info-circle';

  if (norm === 'CRITICAL') {
    badgeClass = 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50';
    icon = 'bi-fire';
  } else if (norm === 'HIGH') {
    badgeClass = 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50';
    icon = 'bi-exclamation-triangle-fill';
  } else if (norm === 'MEDIUM') {
    badgeClass = 'bg-info bg-opacity-25 text-info border border-info border-opacity-50';
    icon = 'bi-bell-fill';
  }

  return (
    <span className={`badge ${badgeClass} px-2 py-1 small d-inline-flex align-items-center gap-1`}>
      <i className={`bi ${icon}`}></i>
      {norm}
    </span>
  );
}

/**
 * Technical SLA Tier Badge
 * @param {Object} props
 * @param {string} props.tier
 */
export function TierBadge({ tier }) {
  switch (tier) {
    case 'Mission-Critical':
      return (
        <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1">
          <i className="bi bi-shield-fill-check me-1"></i>Mission-Critical
        </span>
      );
    case 'Enterprise SLA':
      return (
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-2 py-1">
          <i className="bi bi-award-fill me-1"></i>Enterprise SLA
        </span>
      );
    default:
      return (
        <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50 px-2 py-1">
          Standard
        </span>
      );
  }
}

/**
 * Integration Stage Badge
 * @param {Object} props
 * @param {string} props.stage
 */
export function StageBadge({ stage }) {
  switch (stage) {
    case 'production':
      return (
        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
          <i className="bi bi-check-circle me-1"></i>Production
        </span>
      );
    case 'uat':
      return (
        <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 px-2 py-1">
          UAT
        </span>
      );
    case 'review':
      return (
        <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1">
          Arch Review
        </span>
      );
    case 'sandbox':
      return <span className="badge bg-secondary bg-opacity-25 text-light px-2 py-1">Sandbox</span>;
    default:
      return <span className="badge bg-dark text-secondary px-2 py-1">{stage}</span>;
  }
}

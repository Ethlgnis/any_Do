// Skeleton Loading Components
export function Skeleton({ className = '', style = {} }) {
    return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonText({ width = '100%', lines = 1 }) {
    return (
        <div className="skeleton-text-group">
            {[...Array(lines)].map((_, i) => (
                <div
                    key={i}
                    className="skeleton skeleton-text"
                    style={{ width: i === lines - 1 ? '60%' : width }}
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="skeleton skeleton-card" />
    );
}

export function SkeletonStat() {
    return (
        <div className="skeleton skeleton-stat" />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="loading-container">
            <div className="skeleton skeleton-title" style={{ width: '200px' }} />
            <div className="skeleton skeleton-text-sm" style={{ width: '300px', height: '14px' }} />

            <div className="stats-loading" style={{ marginTop: '24px' }}>
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
            </div>

            <div style={{ marginTop: '32px' }}>
                <div className="skeleton skeleton-title" style={{ width: '150px' }} />
                <div className="loading-grid">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </div>
    );
}

export function FilesSkeleton() {
    return (
        <div className="loading-container">
            <div className="skeleton skeleton-title" style={{ width: '150px' }} />
            <div className="loading-grid">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton skeleton-card" style={{ height: '200px' }} />
                ))}
            </div>
        </div>
    );
}

export function LinksSkeleton() {
    return (
        <div className="loading-container">
            <div className="skeleton skeleton-title" style={{ width: '120px' }} />
            <div className="loading-grid">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton skeleton-card" style={{ height: '160px' }} />
                ))}
            </div>
        </div>
    );
}

export function TodosSkeleton() {
    return (
        <div className="loading-container">
            <div className="skeleton skeleton-title" style={{ width: '140px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
                ))}
            </div>
        </div>
    );
}

export default Skeleton;

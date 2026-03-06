import { Crown, Check, Zap, Shield, Star, Cloud } from 'lucide-react';
import './SubscriptionSection.scss';

export default function SubscriptionSection() {
    const plans = [
        {
            id: 'free',
            name: 'Basic',
            price: '0',
            duration: 'forever',
            description: 'Essential features for personal use',
            features: [
                'Up to 1GB storage',
                'Basic file management',
                'Standard support',
                'Upload max 50MB per file'
            ],
            icon: Star,
            color: '#6366f1',
            buttonText: 'Current Plan',
            isCurrent: true
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '29',
            duration: 'per month',
            description: 'Advanced features for professionals',
            features: [
                'Up to 100GB storage',
                'Advanced file management',
                'Priority support',
                'Upload max 2GB per file',
                'Ad-free experience',
                'Custom themes'
            ],
            icon: Zap,
            color: '#a855f7',
            buttonText: 'Upgrade to Pro',
            isCurrent: false,
            popular: true
        },
        {
            id: 'elite',
            name: 'Elite',
            price: '99',
            duration: 'per month',
            description: 'Maximum power for power users',
            features: [
                'Unlimited storage',
                'Advanced sharing controls',
                '24/7 Priority support',
                'Upload max 20GB per file',
                'Custom domain',
                'Early access to new features'
            ],
            icon: Crown,
            color: '#ec4899',
            buttonText: 'Get Elite',
            isCurrent: false
        }
    ];

    return (
        <section className="subscription-section animate-fade-in">
            <div className="section-header">
                <div>
                    <h1 className="section-title gradient-text">Choose Your Plan</h1>
                    <p className="section-subtitle">Unlock more power and storage with our premium plans</p>
                </div>
            </div>

            <div className="pricing-grid">
                {plans.map((plan, index) => {
                    const Icon = plan.icon;
                    return (
                        <div 
                            key={plan.id} 
                            className={`pricing-card stagger-item ${plan.popular ? 'popular' : ''} ${plan.isCurrent ? 'current' : ''}`}
                            style={{ 
                                animationDelay: `${index * 0.15}s`,
                                '--plan-color': plan.color 
                            } as React.CSSProperties}
                        >
                            {plan.popular && (
                                <div className="popular-badge">
                                    <Zap size={14} /> Most Popular
                                </div>
                            )}
                            
                            <div className="plan-header">
                                <div className="plan-icon">
                                    <Icon size={28} />
                                </div>
                                <h2 className="plan-name">{plan.name}</h2>
                                <p className="plan-description">{plan.description}</p>
                            </div>
                            
                            <div className="plan-price-container">
                                <span className="currency">₹</span>
                                <span className="price">{plan.price}</span>
                                <span className="duration">/{plan.duration}</span>
                            </div>
                            
                            <ul className="feature-list">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="feature-item">
                                        <div className="check-icon">
                                            <Check size={16} />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <button className={`btn plan-btn ${plan.isCurrent ? 'btn-secondary' : 'btn-primary'}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="features-showcase stagger-item" style={{ animationDelay: '0.6s' }}>
                <div className="showcase-header">
                    <h2>Premium Features</h2>
                    <p>Why upgrade to a paid plan?</p>
                </div>
                
                <div className="showcase-grid">
                    <div className="showcase-card">
                        <div className="showcase-icon" style={{ color: '#3b82f6' }}>
                            <Cloud size={24} />
                        </div>
                        <h3>More Storage</h3>
                        <p>Stop worrying about space. Get up to unlimited cloud storage for all your important files and documents.</p>
                    </div>
                    
                    <div className="showcase-card">
                        <div className="showcase-icon" style={{ color: '#22c55e' }}>
                            <Shield size={24} />
                        </div>
                        <h3>Enhanced Security</h3>
                        <p>Protect your sensitive data with advanced encryption, two-factor authentication, and detailed access logs.</p>
                    </div>
                    
                    <div className="showcase-card">
                        <div className="showcase-icon" style={{ color: '#f59e0b' }}>
                            <Zap size={24} />
                        </div>
                        <h3>Faster Uploads</h3>
                        <p>Enjoy priority bandwidth and larger file size limits to get your work done faster without interruptions.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}


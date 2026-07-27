import React from 'react';
import { Gem, Crown, Medal, Award } from 'lucide-react';

/**
 * ProductTierIcon
 * Renders an icon and badge for the POI product importance tier:
 * 1. Diamond (Diamante) - Top #1
 * 2. Gold (Ouro) - #2
 * 3. Silver (Prata) - #3
 * 4. Bronze (Bronze) - #4
 */
export default function ProductTierIcon({ tier, showLabel = true, className = '', style = {} }) {
  const normalizedTier = (tier || 'bronze').toLowerCase();

  const tierConfig = {
    diamond: {
      label: 'Diamond',
      sublabel: 'Importância #1 - Top Visitantes',
      Icon: Gem
    },
    gold: {
      label: 'Gold',
      sublabel: 'Importância #2 - Destaque Ouro',
      Icon: Crown
    },
    silver: {
      label: 'Silver',
      sublabel: 'Importância #3 - Recomendado',
      Icon: Medal
    },
    bronze: {
      label: 'Bronze',
      sublabel: 'Importância #4 - Visitado',
      Icon: Award
    }
  };

  const config = tierConfig[normalizedTier] || tierConfig.bronze;
  const IconComponent = config.Icon;

  return (
    <div 
      className={`product-tier-badge tier-${normalizedTier} ${className}`}
      title={`Product ${config.label} (${config.sublabel})`}
      style={style}
    >
      <IconComponent size={14} className="tier-icon" />
      {showLabel && (
        <span className="tier-label">
          {config.label}
        </span>
      )}
    </div>
  );
}


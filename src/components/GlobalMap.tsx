import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTranslation } from 'react-i18next';

interface BranchLocation {
  name: string;
  latitude: number;
  longitude: number;
  url?: string;
}

function getMapboxTokenError(token: string | undefined): string | null {
  if (!token) return 'Mapbox token is missing.';
  if (token.startsWith('sk.')) {
    return 'Invalid Mapbox token type: use a public token (pk.*), not a secret token (sk.*).';
  }
  if (!token.startsWith('pk.')) {
    return 'Invalid Mapbox token format: expected a public token starting with pk.*.';
  }
  return null;
}

const GlobalMap = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/branch_locations.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load branch locations');
        }
        return response.json();
      })
      .then((data) => setBranches(data))
      .catch((error) => {
        console.error('Error loading branch locations:', error);
        setMapError(t('globalMap.errorLoadingBranches'));
      });
  }, [t]);

  useEffect(() => {
    if (!mapContainer.current || branches.length === 0) return;

    const tokenError = getMapboxTokenError(mapboxToken);
    if (tokenError) {
      // Keep translation key for existing UI, but include a concrete hint for debugging.
      setMapError(`${t('globalMap.errorMapboxKey')} (${tokenError})`);
      return;
    }

    setMapError(null);

    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/standard',
        projection: { name: 'globe' },
        zoom: 1.5,
        center: [30, 20],
        pitch: 0,
      });
    } catch (e) {
      console.error('Mapbox initialization error:', e);
      setMapError(t('globalMap.errorLoadingMap'));
      return;
    }

    map.current.on('error', () => {
      setMapError(t('globalMap.errorLoadingMap'));
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.scrollZoom.disable();

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(30, 30, 40)',
        'high-color': 'rgb(50, 50, 70)',
        'horizon-blend': 0.4,
        'space-color': 'rgb(10, 10, 20)',
        'star-intensity': 0.6
      });
    });

    const secondsPerRevolution = 180;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;
    let isSpinning = false;

    function spinGlobe() {
      if (!map.current || isSpinning) return;
      
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        isSpinning = true;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    map.current.on('mousedown', () => {
      userInteracting = true;
    });
    
    map.current.on('dragstart', () => {
      userInteracting = true;
    });
    
    map.current.on('mouseup', () => {
      userInteracting = false;
      spinGlobe();
    });
    
    map.current.on('touchend', () => {
      userInteracting = false;
      spinGlobe();
    });

    map.current.on('moveend', () => {
      isSpinning = false;
      spinGlobe();
    });

    // Add markers for branches
    branches.forEach((branch) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundImage = 'url(/icons/uberfix-pin.png)';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.3s ease';
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3) translateY(-5px)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1) translateY(0)';
      });

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(`
        <div style="padding: 8px; text-align: center; direction: ${isRTL ? 'rtl' : 'ltr'};">
          <strong style="color: #f59e0b; font-size: 14px;">${branch.name}</strong>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([branch.longitude, branch.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    spinGlobe();

    return () => {
      map.current?.remove();
    };
  }, [branches, mapboxToken, isRTL, t]);

  return (
    <section className="relative py-20 bg-muted overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-transparent pointer-events-none" />

      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('globalMap.title')}
            <span className="bg-gradient-primary bg-clip-text text-transparent"> {t('globalMap.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('globalMap.subtitle', { count: branches.length })}
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-elevated animate-scale-in" style={{ height: '600px' }}>
          <div ref={mapContainer} className="absolute inset-0" />

          {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <p className="text-base font-medium text-muted-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
                {mapError}
              </p>
            </div>
          ) : (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full border border-border shadow-lg" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className="text-sm text-foreground font-medium">
                🌍 {t('globalMap.activeLocations', { count: branches.length })} • <span className="text-primary">{t('globalMap.service247')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GlobalMap;

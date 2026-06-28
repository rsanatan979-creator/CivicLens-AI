import React, { useEffect, useRef, useState } from 'react';
import { AuthService } from '../services/auth.service';
import { MapPin, AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  onClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (reportId: string) => void;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    category?: string;
    severity?: string;
    status?: string;
  }>;
  draggableMarker?: boolean;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      scriptLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

let leafletLoadingPromise: Promise<void> | null = null;

function loadLeafletResources(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).L) {
    return Promise.resolve();
  }
  if (leafletLoadingPromise) return leafletLoadingPromise;

  leafletLoadingPromise = new Promise((resolve, reject) => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      leafletLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return leafletLoadingPromise;
}


export const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom = 12,
  onClick,
  onMarkerClick,
  markers = [],
  draggableMarker = false,
  onMarkerDragEnd,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const mainMarkerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  // Fallback map state
  const [selectedFallbackMarkerId, setSelectedFallbackMarkerId] = useState<string | null>(null);

  // Leaflet state & refs
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);

  // Wrap callbacks in refs to prevent stale closures in Google Map event listeners
  const onClickRef = useRef(onClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMarkerDragEndRef = useRef(onMarkerDragEnd);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    onMarkerDragEndRef.current = onMarkerDragEnd;
  }, [onMarkerDragEnd]);

  // 1. Fetch API Key from backend on mount
  useEffect(() => {
    AuthService.getMapsApiKey()
      .then((res) => {
        if (!res.apiKey) {
          setError('GOOGLE_MAPS_API_KEY_MISSING');
        } else {
          setApiKey(res.apiKey);
        }
      })
      .catch((err) => {
        console.error('Error fetching Maps API key:', err);
        setError('GOOGLE_MAPS_API_KEY_ERROR');
      });
  }, []);

  // 2. Load Google Maps script once key is retrieved
  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMapsScript(apiKey)
      .then(() => setScriptLoaded(true))
      .catch((err) => {
        console.error('Failed to load Google Maps SDK script:', err);
        setError('GOOGLE_MAPS_SDK_LOAD_ERROR');
      });
  }, [apiKey]);

  // 3. Initialize Map once script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || map) return;

    const initializedMap = new (window as any).google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(initializedMap);

    const infoWindow = new (window as any).google.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    initializedMap.addListener('click', (e: any) => {
      if (onClickRef.current) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onClickRef.current(lat, lng);
      }
    });
  }, [scriptLoaded, map]);

  // 4. Update map center when props update
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  // 5. Draggable Selection Marker
  useEffect(() => {
    if (!map || !scriptLoaded) return;

    if (draggableMarker) {
      if (mainMarkerRef.current) {
        mainMarkerRef.current.setPosition(center);
      } else {
        mainMarkerRef.current = new (window as any).google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: (window as any).google.maps.Animation.DROP,
        });

        mainMarkerRef.current.addListener('dragend', () => {
          if (onMarkerDragEndRef.current) {
            const pos = mainMarkerRef.current.getPosition();
            onMarkerDragEndRef.current(pos.lat(), pos.lng());
          }
        });
      }
    } else {
      if (mainMarkerRef.current) {
        mainMarkerRef.current.setMap(null);
        mainMarkerRef.current = null;
      }
    }

    return () => {
      if (mainMarkerRef.current) {
        mainMarkerRef.current.setMap(null);
        mainMarkerRef.current = null;
      }
    };
  }, [map, scriptLoaded, draggableMarker, center]);

  // 6. Support rendering multiple markers with InfoWindows (Single shared InfoWindow)
  useEffect(() => {
    if (!map || !scriptLoaded) return;

    // Clear old markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    if (markers.length === 0) return;

    const bounds = new (window as any).google.maps.LatLngBounds();
    let hasMarkers = false;

    markers.forEach((m) => {
      const position = { lat: m.lat, lng: m.lng };
      const marker = new (window as any).google.maps.Marker({
        position,
        map,
        title: m.title,
      });

      const infoWindowContent = `
        <div style="color: #1e293b; font-family: sans-serif; padding: 6px; min-width: 160px; max-width: 220px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3;">${m.title}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; font-weight: 500;">${m.category || 'General'}</p>
          <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; background-color: #fee2e2; color: #991b1b;">${m.severity || 'MEDIUM'}</span>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; background-color: #fef3c7; color: #92400e;">${m.status || 'PENDING'}</span>
          </div>
          <button id="btn-${m.id}" style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; width: 100%; text-align: center; transition: all 0.2s;">View Details</button>
        </div>
      `;

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoWindowContent);
          infoWindowRef.current.open(map, marker);
          
          (window as any).google.maps.event.addListenerOnce(infoWindowRef.current, 'domready', () => {
            const btn = document.getElementById(`btn-${m.id}`);
            if (btn && onMarkerClickRef.current) {
              btn.onclick = () => {
                if (onMarkerClickRef.current) {
                  onMarkerClickRef.current(m.id);
                }
              };
            }
          });
        }
      });

      googleMarkersRef.current.push(marker);
      bounds.extend(position);
      hasMarkers = true;
    });

    if (hasMarkers && markers.length > 1) {
      map.fitBounds(bounds);
    }
  }, [map, scriptLoaded, markers]);

  // Load Leaflet resources if Google Maps key is missing or failed
  useEffect(() => {
    if (error || !apiKey) {
      loadLeafletResources()
        .then(() => setLeafletLoaded(true))
        .catch((err) => {
          console.error('Failed to load Leaflet:', err);
        });
    }
  }, [error, apiKey]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || map || leafletMapRef.current) return;

    const L = (window as any).L;
    const initializedMap = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(initializedMap);

    leafletMapRef.current = initializedMap;

    initializedMap.on('click', (e: any) => {
      if (onClickRef.current) {
        onClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    setTimeout(() => {
      initializedMap.invalidateSize();
    }, 200);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [leafletLoaded, map]);

  // Update Leaflet Map center when props change
  useEffect(() => {
    if (leafletMapRef.current && center) {
      leafletMapRef.current.panTo([center.lat, center.lng]);
    }
  }, [center]);

  // Handle Leaflet main draggable marker
  useEffect(() => {
    if (!leafletMapRef.current || !leafletLoaded) return;

    const L = (window as any).L;

    if (draggableMarker) {
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng([center.lat, center.lng]);
      } else {
        const marker = L.marker([center.lat, center.lng], {
          draggable: true
        }).addTo(leafletMapRef.current);

        marker.on('dragend', () => {
          if (onMarkerDragEndRef.current) {
            const pos = marker.getLatLng();
            onMarkerDragEndRef.current(pos.lat, pos.lng);
          }
        });

        leafletMarkerRef.current = marker;
      }
    } else {
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.remove();
        leafletMarkerRef.current = null;
      }
    }

    return () => {
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.remove();
        leafletMarkerRef.current = null;
      }
    };
  }, [leafletLoaded, draggableMarker, center]);

  // Handle Leaflet multiple markers with popups
  useEffect(() => {
    if (!leafletMapRef.current || !leafletLoaded) return;

    const L = (window as any).L;

    // Clear old markers
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    if (markers.length === 0) return;

    const bounds: any[] = [];

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng]).addTo(leafletMapRef.current);

      const popupContent = document.createElement('div');
      popupContent.style.color = '#1e293b';
      popupContent.style.fontFamily = 'sans-serif';
      popupContent.style.padding = '6px';
      popupContent.style.minWidth = '160px';
      popupContent.style.maxWidth = '220px';
      popupContent.innerHTML = `
        <h4 style="margin: 0 0 4px 0; font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3;">${m.title}</h4>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; font-weight: 500;">${m.category || 'General'}</p>
        <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; background-color: #fee2e2; color: #991b1b;">${m.severity || 'MEDIUM'}</span>
          <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; background-color: #fef3c7; color: #92400e;">${m.status || 'PENDING'}</span>
        </div>
        <button id="leaflet-btn-${m.id}" style="background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; width: 100%; text-align: center; transition: all 0.2s;">View Details</button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`leaflet-btn-${m.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onMarkerClickRef.current) {
              onMarkerClickRef.current(m.id);
            }
          };
        }
      });

      leafletMarkersRef.current.push(marker);
      bounds.push([m.lat, m.lng]);
    });

    if (markers.length > 1) {
      leafletMapRef.current.fitBounds(bounds);
    }
  }, [leafletLoaded, markers]);


  // Coordinates mapping logic for interactive mock map
  const minLat = 40.70;
  const maxLat = 40.73;
  const minLng = -74.02;
  const maxLng = -73.99;

  const getPercent = (lat: number, lng: number) => {
    const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
    const clampedLng = Math.max(minLng, Math.min(maxLng, lng));
    const y = ((maxLat - clampedLat) / (maxLat - minLat)) * 100;
    const x = ((clampedLng - minLng) / (maxLng - minLng)) * 100;
    return { x, y };
  };

  const handleFallbackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClickRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;

    const lng = minLng + pctX * (maxLng - minLng);
    const lat = maxLat - pctY * (maxLat - minLat);
    onClickRef.current(lat, lng);
  };

  // If error state or API key is missing, show interactive Leaflet map
  if (error || !apiKey) {
    if (!leafletLoaded) {
      return (
        <div className="w-full h-full min-h-[350px] bg-slate-50 border border-slate-200/60 rounded-3xl flex items-center justify-center text-slate-400 font-semibold shadow-inner">
          Loading map...
        </div>
      );
    }

    return (
      <div className="w-full h-full min-h-[350px] relative rounded-3xl overflow-hidden shadow-inner border border-slate-200/30 bg-slate-100">
        <div ref={mapRef} className="w-full h-full min-h-[350px] relative z-10" />
      </div>
    );
  }

  // 7. Regular Google Maps element
  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-3xl shadow-inner border border-slate-200/30 overflow-hidden" />;
};

export default GoogleMap;


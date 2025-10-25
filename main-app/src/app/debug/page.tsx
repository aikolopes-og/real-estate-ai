'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties...');
        const response = await fetch('/api/imoveis');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        setProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', fontSize: '18px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Debug Page</h1>
      <p>Found {properties.length} properties</p>
      
      {properties.map((property, index) => (
        <div 
          key={property.id || index}
          style={{ 
            border: '1px solid #ccc', 
            margin: '10px 0', 
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h3 style={{ color: '#333' }}>{property.titulo}</h3>
          <p>Type: {property.tipo}</p>
          <p>Value: R$ {property.valor?.toLocaleString()}</p>
          <p>Location: {property.localizacao}</p>
          <p>Bedrooms: {property.quartos}</p>
          <p>Bathrooms: {property.banheiros}</p>
          <p>Area: {property.area} m²</p>
          {property.imagens && property.imagens.length > 0 && (
            <img 
              src={property.imagens[0]} 
              alt={property.titulo}
              style={{ width: '200px', height: 'auto' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
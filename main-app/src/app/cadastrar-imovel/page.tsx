"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function CadastrarImovelPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    price: '',
    priceType: 'SALE',
    bedrooms: '',
    bathrooms: '',
    area: '',
    parkingSpaces: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    virtualTourUrl: '',
    amenities: [] as string[],
  })

  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null)
 

  const [amenityInput, setAmenityInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validações
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      setLoading(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Preço deve ser maior que zero');
      setLoading(false);
      return;
    }

    try {
      // Se houver arquivos selecionados, faça upload primeiro
      let uploadedUrls: string[] = []
      if (selectedFiles && selectedFiles.length > 0) {
        setUploadProgress(`Enviando ${selectedFiles.length} ${selectedFiles.length === 1 ? 'imagem' : 'imagens'}...`);
        const form = new FormData()
        selectedFiles.forEach(f => form.append('images', f))
        const uploadResp = await fetch('http://localhost:8001/api/properties/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: form
        })
        if (!uploadResp.ok) {
          const txt = await uploadResp.text()
          throw new Error(txt || 'Falha no upload das imagens')
        }
        const body = await uploadResp.json()
        uploadedUrls = body?.data?.urls || []
        setUploadProgress('Imagens enviadas! Cadastrando imóvel...');
      }
      
      setUploadProgress('Salvando imóvel...');

      
      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        status: 'AVAILABLE',
        price: parseFloat(formData.price),
        priceType: formData.priceType,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0,
        parkingSpaces: parseInt(formData.parkingSpaces) || 0,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'Brasil',
        images: uploadedUrls.length ? uploadedUrls : [],
        virtualTourUrl: formData.virtualTourUrl || null,
        amenities: formData.amenities
      };

      const response = await fetch('http://localhost:8001/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar imóvel');
      }

      setSuccess(true);
      setUploadProgress(null);
      setTimeout(() => {
        router.push('/imoveis');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar imóvel');
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // Verifica se usuário está autenticado e tem permissão
  React.useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    } else if (user?.role !== 'BROKER') {
      router.push('/');
    }
  }, [token, user, router]);

  if (!user || user.role !== 'BROKER') {
    return null;
  }

  const propertyTypes = [
    { value: 'APARTMENT', label: 'Apartamento' },
    { value: 'HOUSE', label: 'Casa' },
  ];

  const priceTypes = [
    { value: 'SALE', label: 'Venda' },
    { value: 'RENT_MONTHLY', label: 'Aluguel Mensal' },
    { value: 'RENT_DAILY', label: 'Aluguel Diário' },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3"
            >
              <Image src="/icons8-home.svg" alt="EasyHome" width={32} height={32} />
              <span className="font-bold text-white text-xl">EasyHome</span>
            </button>
            <button
              onClick={() => router.push('/imoveis')}
              className="px-6 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Ver Imóveis
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass p-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏠</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white gradient-text mb-2">
                Cadastrar Novo Imóvel
              </h1>
              <p className="text-white/80 font-medium">
                Preencha os dados do imóvel para cadastrar
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200">
                Imóvel cadastrado com sucesso! Redirecionando...
              </div>
            )}

            {uploadProgress && (
              <div className="mb-6 p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200 flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full"></div>
                <span>{uploadProgress}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Informações Básicas</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-white/90 mb-2">
                      Título *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="Ex: Apartamento 3 quartos no centro"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-white/90 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                      placeholder="Descreva o imóvel..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="propertyType" className="block text-sm font-semibold text-white/90 mb-2">
                        Tipo de Imóvel *
                      </label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        required
                        value={formData.propertyType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      >
                        {propertyTypes.map(type => (
                          <option key={type.value} value={type.value} className="bg-gray-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priceType" className="block text-sm font-semibold text-white/90 mb-2">
                        Tipo de Negociação *
                      </label>
                      <select
                        id="priceType"
                        name="priceType"
                        required
                        value={formData.priceType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      >
                        {priceTypes.map(type => (
                          <option key={type.value} value={type.value} className="bg-gray-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-white/90 mb-2">
                      Preço (R$) *
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="350000.00"
                    />
                  </div>
                </div>
              </div>

              {/* Fotos */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Fotos do Imóvel</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-all">
                    <input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : null)}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📸</span>
                      </div>
                      <p className="text-white font-semibold mb-2">
                        Clique para selecionar imagens
                      </p>
                      <p className="text-white/60 text-sm">
                        PNG, JPG ou WEBP (máx. 10 imagens)
                      </p>
                    </label>
                  </div>
                  
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from(selectedFiles).map((file, idx) => (
                        <div key={idx} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden bg-white/10 border border-white/20">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = Array.from(selectedFiles).filter((_, i) => i !== idx);
                              setSelectedFiles(newFiles.length > 0 ? newFiles : null);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          >
                            ✕
                          </button>
                          <p className="text-xs text-white/60 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedFiles && selectedFiles.length > 0 && (
                    <p className="text-sm text-white/80">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                    </p>
                  )}
                </div>
              </div>

              {/* Características */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-semibold text-white/90 mb-2">
                      Quartos
                    </label>
                    <input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-semibold text-white/90 mb-2">
                      Banheiros
                    </label>
                    <input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-semibold text-white/90 mb-2">
                      Área (m²)
                    </label>
                    <input
                      id="area"
                      name="area"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="85.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="parkingSpaces" className="block text-sm font-semibold text-white/90 mb-2">
                      Vagas
                    </label>
                    <input
                      id="parkingSpaces"
                      name="parkingSpaces"
                      type="number"
                      min="0"
                      value={formData.parkingSpaces}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Localização</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-white/90 mb-2">
                      Endereço *
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      placeholder="Rua Principal, 123"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-white/90 mb-2">
                        Cidade *
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        placeholder="Goiânia"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-semibold text-white/90 mb-2">
                        Estado *
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        placeholder="GO"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-semibold text-white/90 mb-2">
                        CEP *
                      </label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                        placeholder="74000-000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comodidades */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Comodidades</h2>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder="Ex: Piscina, Academia, Churrasqueira..."
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center gap-2"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="text-red-300 hover:text-red-200 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tour Virtual */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Tour Virtual (Opcional)</h2>
                <div>
                  <label htmlFor="virtualTourUrl" className="block text-sm font-semibold text-white/90 mb-2">
                    URL do Tour Virtual
                  </label>
                  <input
                    id="virtualTourUrl"
                    name="virtualTourUrl"
                    type="url"
                    value={formData.virtualTourUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
